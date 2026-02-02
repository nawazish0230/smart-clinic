const { Patient, PATIENT_STATUS } = require('../models/Patient');
const PatientReadView = require('../models/PatientReadView');
const { ConflictError, NotFoundError, ValidationError } = require('../utils/errors');
const { EVENT_TYPES, publishEvent } = require('../utils/eventProducer');
const logger = require('../utils/logger');

/** 
* Create new patient
* @param {Object} patientData - Patient data
* @returns {Promise<Object>} - Created patient
* @throws {ConflictError} - If patient already exists
* @throws {Error} - If failed to create patient
*/
const createPatient = async (patientData) => {
  const { userId, email } = patientData;
  // check if patient already exists with userId 
  // doubt : how we will get userId while create ?
  if (userId) {
    const existingByUserId = await Patient.findByUserId(userId);
    if (existingByUserId) {
      throw new ConflictError('Patient already exists with this userId');
    }
  }

  // check if patient already exists with email 
  if (email) {
    const existingByEmail = await Patient.findByEmail(email);
    if (existingByEmail) {
      throw new ConflictError('Patient already exists with this email');
    }
  }

  // create new patient with status ACTIVE
  const patient = new Patient({
    ...patientData,
    email: email ? email.toLowerCase().trim() : null,
    status: PATIENT_STATUS.ACTIVE,
  });

  // save patient to database
  await patient.save();
  logger.info(`Patient created successfully with id: ${patient._id} ${patient.email}`);

  // update read view (CQRS)
  await PatientReadView.updateFromPatient(patient);


  // Publish PATIENT_CREATED event
  await publishEvent(EVENT_TYPES.PATIENT_CREATED, {
    patientId: patient._id.toString(),
    userId: patient.userId,
    email: patient.email,
    firstName: patient.firstName,
    lastName: patient.lastName
  })

  // return patient object
  return patient;
};

/** 
* Get patient by patientId
* @param {string} patientId - the Id of the patient to retrieve
* @returns {Promise<Object> | null} - Patient or null if not found
* @throws {NotFoundError} - If patient not found
*/

// No try-catch here: errors (e.g. DB failure, CastError) propagate to the controller,
// which uses try-catch + next(error) so the global error middleware can format the response.
const getPatientById = async (patientId) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }
  return patient;
};

/** 
* Get patient by userId
* @param {string} userId - the User Id from the auth service
* @returns {Promise<Object> | null} - Patient or null if not found
* @throws {NotFoundError} - If patient not found
*/
const getPatientByUserId = async (userId) => {
  const patient = await Patient.findByUserId(userId);
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }
  return patient;
};

/**
* Get patient by email
* @param {string} email - the email of the patient to retrieve
* @returns {Promise<Object> | null} - Patient or null if not found
* @throws {NotFoundError} - If patient not found
*/
const getPatientByEmail = async (email) => {
  const patient = await Patient.findByEmail(email.toLowerCase());
  if (!patient) {
    return null;
  }
  return patient;
};

/**
 * Get All Patients with Pagination and filters
 * @param {Object} filters - filter options
 * @param {Number} page - page number
 * @param {Number} limit - number of records per page
 * @returns {Object} paginated list of patients
 */
const getAllPatients = async (filters = {}, page = 1, limit = 10, useReadView = true) => {
  const query = {};

  // Apply filters
  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.city) {
    query.city = new RegExp(filters.city, 'i'); // case insensitive
  }

  if (filters.search) {
    // use text search on read for better performance
    //query.$text = { $search: filters.search };

    // simple or condition on name and email fields
    query.$or = [
      { firstName: new RegExp(filters.search, 'i') },
      { lastName: new RegExp(filters.search, 'i') },
      { email: new RegExp(filters.search, 'i') },
    ];
  }

  const skip = (page - 1) * limit;

  // User read optimized view dfor fetching patients (CQRS)
  if (useReadView) {
    const [patients, total] = await Promise.all([
      PatientReadView.find(query).sort({ registrationDate: -1 }).skip(skip).limit(limit),
      PatientReadView.countDocuments(query)
    ])

    // fetch full patient data if needed (can be optimized further if required)
    const patientIds = patients.map(patient => patient.patientId);
    const fullPatients = await Patient.find({ _id: { $in: patientIds } });

    return {
      patients: fullPatients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    }
  }

  // fallback to write model if read view not available
  const [patients, total] = await Promise.all([
    Patient.find(query)
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(limit),
    Patient.countDocuments(query)
  ])

  return {
    patients,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }
  }
};

/**
 * Update Patient Details
 * @param {String} patientId - ID of the patient to update
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated Patient object
 */
const updatePatient = async (patientId, updateData) => {
  const patient = await getPatientById(patientId);
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  // handle email update separately to check for conflicts
  if (updateData.email && updateData.email !== patient.email) {
    const existingByEmail = await Patient.findByEmail(updateData.email);
    if (existingByEmail && existingByEmail._id.toString() !== patientId) {
      throw new ConflictError('Another patient already exists with this email');
    }
    updateData.email = updateData.email.toLowerCase().trim();
  }

  Object.assign(patient, updateData);
  await patient.save();

  logger.info(`Patient updated successfully with id: ${patient._id} ${patient.email}`);

  // Update read view (CQRS)
  await PatientReadView.updateFromPatient(patient);


  // Publish PATIENT_UPDATED event
  await publishEvent(EVENT_TYPES.PATIENT_UPDATED, {
    patientId: patient._id.toString(),
    userId: patient.userId,
    email: patient.email,
    updatedFields: Object.keys(updateDate)
  });


  return patient;
}

/***
 * Delete patient (sft delete by setting status to INACTIVE)
 * @param {String} patientId - ID of the patient to delete
 */
const deletePatient = async (patientId) => {
  const patient = await getPatientById(patientId);
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }
  patient.status = PATIENT_STATUS.INACTIVE;
  await patient.save();

  logger.info(`Patient deleted successfully with id: ${patient._id} ${patient.email}`);

  // Update read view (CQRS)
  await PatientReadView.updateFromPatient(patient);


  // Publish PATIENT_DELETED event
  await publishEvent(EVENT_TYPES.PATIENT_DELETED, {
    patientId: patient._id.toString(),
    userId: patient.userId,
    email: patient.email
  });

  return patient
}

/**
 * Add medical history item
 * @param {String} patientId - ID of the patient
 * @param {Object} historyItem - Medical history item to add
 * @return {Object} Updated Patient object
 */
// doubt: how to edit/delete medical history / allergy / medication item ?
// for CRUD we need id as well
const addMedicalHistory = async (patientId, historyItem) => {
  const patient = await getPatientById(patientId);
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  await patient.addMedicalHistoryItem(historyItem);

  logger.info(`Medical history item added successfully with id: ${patient._id} ${patient.email}`);

  // Update read view (CQRS)
  await PatientReadView.updateFromPatient(patient);



  // Publish MEDICAL_HISTORY_ADDED event
  await publishEvent(EVENT_TYPES.MEDICAL_HISTRORY_ADDED, {
    patientId: patient._id.toString(),
    condition: historyItem.condition,
    status: historyItem.status
  });

  return patient;
}


/**
 * Add allergy item
 * @param {String} patientId - ID of the patient
 * @param {Object} allergyItem - Allergy item to add
 * @return {Object} Updated Patient object
 */
const addAllergy = async (patientId, allergyItem) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  await patient.addAllergy(allergyItem);
  logger.info(`Allergy added for patient: ${patient._id})`);

  // Update read view (CQRS)
  await PatientReadView.updateFromPatient(patient);

  // Publish event ALLERGY_ADDED
  await publishEvent(EVENT_TYPES.ALLERGY_ADDED, {
    patientId: patient._id.toString(),
    allergen: allergyItem.allergen,
    severity: allergyItem.severity
  });

  return patient;
}

/**
 * Add medication item
 * @param {String} patientId - ID of the patient
 * @param {Object} medicationItem - Medication item to add
 * @return {Object} Updated Patient object
 */
const addMedication = async (patientId, medicationItem) => {
  const patient = await getPatientById(patientId);

  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  await patient.addMedication(medicationItem);
  logger.info(`Medication added for patient: ${patient._id})`);

  // Update read view (CQRS)
  await PatientReadView.updateFromPatient(patient);


  // Publish MEDICATION_ADDED event
  await publishEvent(EVENT_TYPES.MEDICATION_ADDED, {
    patientId: patient._id.toString(),
    medicationName: medicationItem.name,
    dosage: medicationItem.dosage
  });

  return patient;
}

/**
 * Update last visit date
 * @param {String} patientId - ID of the patient
 * @returns {Object} Updated Patient object
 */
const updateLastVisit = async (patientId) => {
  const patient = await getPatientById(patientId);
  if (!patient) {
    throw new NotFoundError('Patient not found');
  }

  patient.lastVisitDate = new Date();
  await patient.save();

  logger.info(`Last visit date updated for patient: ${patient._id})`);

  // Update read view (CQRS)
  await PatientReadView.updateFromPatient(patient);
  return patient;
}


module.exports = {
  createPatient,
  getPatientById,
  getPatientByUserId,
  getPatientByEmail,
  getAllPatients,
  updatePatient,
  deletePatient,
  addMedicalHistory,
  addAllergy,
  addMedication,
  updateLastVisit
};