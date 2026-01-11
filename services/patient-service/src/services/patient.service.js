const { Patient, PATIENT_STATUS } = require('../models/Patient');
const { ConflictError, NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/*
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

    // return patient object
    return patient;
  } catch (error) {
    logger.error(`Failed to create patient: ${error.message}`);
    throw new Error('Failed to create patient');
  }
};

/*
* Get patient by patientId
* @param {string} patientId - the Id of the patient to retrieve
* @returns {Promise<Object> | null} - Patient or null if not found
* @throws {NotFoundError} - If patient not found
*/
const getPatientById = async (patientId) => {
  try {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient not found');
    }
    return patient;
  } catch (error) {
    logger.error(`Failed to get patient: ${error.message}`);
    throw new Error('Failed to get patient');
  }
};

/*
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

/*
* Get patient by email
* @param {string} email - the email of the patient to retrieve
* @returns {Promise<Object> | null} - Patient or null if not found
* @throws {NotFoundError} - If patient not found
*/
const getPatientByEmail = async (email) => {
  try {
    const patient = await Patient.findByEmail(email);
    if (!patient) {
      return null;
    }
    return patient;
  } catch (error) {
    throw new Error('Failed to get patient');
  }
};

/*
* Get all patients
* @param {Object} filter - Filter options
* @param {Object} pagination - Pagination options
* @returns {Promise<Object>} - List of patients
* @throws {Error} - If failed to get patients
* @throws {NotFoundError} - If no patients found
* CQRS pattern will be used here
*/
const getAllPatients = async (filter, pagination) => {
  try {
    const patients = await Patient.find(filter).skip(pagination.skip).limit(pagination.limit).sort(pagination.sort);
    return patients;
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