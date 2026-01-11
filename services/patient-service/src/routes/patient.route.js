const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validateCreatePatient } = require('../middlewares/validator.middleware');
const { requiredPatientOrClinicianRole } = require('../middlewares/rbac.middleware');

router
  .post(
    '/',
    authenticate,
    requiredPatientOrClinicianRole,
    validateCreatePatient,
    patientController.createPatient
  );

module.exports = router;