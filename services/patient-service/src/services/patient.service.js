const { Patient, PATIENT_STATUS } = require('../models/Patient');
const { PatientReadView } = require('../models/PatientReadView');
const { ConflictError, NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/** 
* Create new patient
* @param {Object} patientData - Patient data
* @returns {Promise<Object>} - Created patient
* @throws {ConflictError} - If patient already exists
* @throws {Error} - If failed to create patient
*/
const createPatient = async (patientData) => {
  try {
    const { userId, email } = patientData;
    // check if patient already exists with userId 
    // ask : how we will get userId while create ?
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

    // return patient object
    return patient;
  } catch (error) {
    logger.error(`Failed to create patient: ${error.message}`);
    throw new Error('Failed to create patient');
  }
};

/** 
* Get patient by patientId
* @param {string} patientId - the Id of the patient to retrieve
* @returns {Promise<Object> | null} - Patient or null if not found
* @throws {NotFoundError} - If patient not found
*/

// ask -> why try catch is not rquired to used here
const getPatientById = async (patientId) => {
  console.log({ patientId })
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
  try {
    const patient = await Patient.findByUserId(userId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    return patient;
  } catch (error) {
    throw new Error('Failed to get patient');
  }
};

/**
* Get patient by email
* @param {string} email - the email of the patient to retrieve
* @returns {Promise<Object> | null} - Patient or null if not found
* @throws {NotFoundError} - If patient not found
*/
const getPatientByEmail = async (email) => {
  try {
    const patient = await Patient.findByEmail(email.toLowerCase());
    if (!patient) {
      return null;
    }
    return patient;
  } catch (error) {
    throw new Error('Failed to get patient');
  }
};

/**
 * Get All Patients with Pagination and filters
 * @param {Object} filters - filter options
 * @param {Number} page - page number
 * @param {Number} limit - number of records per page
 * @returns {Object} paginated list of patients
 */
const getAllPatients = async (filters = {}, page = 1, limit = 10) => {
  try {

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
    return PatientReadView.find(query).sort({ registrationDate: -1 }).skip(skip).limit(limit);
    PatientReadView.countDocuments(query)

    // return await Patient.find(query)
    //   .sort({ registrationDate: -1 })
    //   .skip(skip)
    //   .limit(limit)

  } catch (error) {
    throw new Error('Failed to get patients');
  }
};

module.exports = {
  createPatient,
  getPatientById,
  getPatientByUserId,
  getPatientByEmail,
  getAllPatients,
};