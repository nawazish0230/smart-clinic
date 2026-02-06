const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateCreatePatient, validateUpdatePatient } = require('../middlewares/validator.middleware');
const { requiredPatientOrClinicianRole, requiredClinician } = require('../middlewares/rbac.middleware');

router
  .post(
    '/',
    authenticate,
    requiredPatientOrClinicianRole,
    validateCreatePatient,
    patientController.createPatient
  );

router
  .get('/',
    authenticate,
    requiredClinician,
    patientController.getAllPatients);

router
  .get('/:id',
    authenticate,
    requiredPatientOrClinicianRole,
    patientController.getPatientById);


// router
//     .get('/me',
//         authenticate,
//         patientController.getMyProfile);

router
  .get('/user/:userId',
    authenticate,
    requiredClinician,
    patientController.getPatientByUserId);



router
  .put('/:id',
    authenticate,
    requiredPatientOrClinicianRole,
    validateUpdatePatient,
    patientController.updatePatient);

router
  .delete('/:id',
    authenticate,
    requiredClinician,
    patientController.deletePatient);

router
  .post('/:id/medical-history',
    authenticate,
    requiredClinician,
    patientController.addMedicalHistory);

router
  .post('/:id/allergy',
    authenticate,
    requiredClinician,
    patientController.addAllergy);

router
  .post('/:id/medication',
    authenticate,
    requiredClinician,
    patientController.addMedication);


module.exports = router;