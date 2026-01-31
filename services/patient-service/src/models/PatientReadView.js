const mongoose = require('mongoose');

/**
 * Read-optmized view of patient data for CQRS.
 * This is a denormalized, indexed collection optmized for read operations.
 * Update via events from the write model (Patient model).
 */

const patientReadViewSchema = new mongoose.Schema({
  // link to write model (Patient model)
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    unique: true,
    index: true,
  },
  userId: {
    type: String,
    index: true
  },

  // Denormalized data for fast read
  fullName: {
    type: String,
    index: true,
  },
  firstName: {
    type: String,
    index: true,
  },
  lastName: {
    type: String,
    index: true,
  },
  email: {
    type: String,
    index: true,
  },
  phone: {
    type: String,
  },

  // computed fields
  age: Number,
  dateOfBirth: Date,
  gender: String,
  bloodType: String,


  // Address (denomalized for search)
  city: {
    type: String,
    index: true,
  },
  state: {
    type: String,
    index: true,
  },
  zipCode: String,
  fullAddress: String,// for full-text search

  // medical summary (denormalized)
  medicalHistoryCount: {
    type: Number,
    default: 0,
  },
  allergiesCount: {
    type: Number,
    default: 0,
  },
  medicationsCount: {
    type: Number,
    default: 0,
  },
  hasActiveCondition: {
    type: Boolean,
    index: true
  },

  // status
  status: {
    type: String,
    index: true
  },

  // timestamps
  registrationDate: Date,
  lastVisitDate: Date,
  lastUpdated: Date,

  // searachable text (for full-text search)
  searchText: {
    type: String,
    index: 'text'
  }
}, {
  timestamps: false, // we manage timestamp manually 
});

// Compound indexes for common search queries
patientReadViewSchema.index({ status: 1, city: 1 });
patientReadViewSchema.index({ lastName: 1, firstName: 1 });
patientReadViewSchema.index({ registrationDate: -1 });
patientReadViewSchema.index({ lastVisitDate: -1 });
patientReadViewSchema.index({ hasActiveCondition: 1, city: 1 });

// text search index
patientReadViewSchema.index({ searchText: 'text' });


/**
 * update read view from patient document
 * @param {Object} patient - patient document from write model
 */
patientReadViewSchema.statics.updateFromPatient = async function (patient) {
  const readViewData = {
    patientId: patient._id,
    userId: patient.userId,
    fullName: `${patient.firstName} ${patient.lastName}`,
    firstName: patient.firstName,
    lastName: patient.lastName,
    email: patient.email,
    phone: patient.phone,
    age: patient.age,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender,
    bloodType: patient.bloodType,
    city: patient.address?.city,
    state: patient.address?.state,
    zipCode: patient.address?.zipCode,
    fullAddress: patient.address ? `${patient.address.street || ''}, ${patient.address.city || ''}, ${patient.address.state || ''} ${patient.address.zipCode || ''}`.trim() : '',
    medicalHistoryCount: patient.medicalHistory?.length || 0,
    allergiesCount: patient.allergies?.length || 0,
    medicationsCount: patient.currentMedications?.length || 0,
    hasActiveCondition: patient.medicalHistroty?.some(h => h.status === 'active' || h.status === 'chronic') || false,
    status: patient.status,
    registrationDate: patient.registrationDate,
    lastVisitDate: patient.lastVisitDate,
    lastUpdated: new Date(),
    searchText: [
      patient.firstName,
      patient.lastName,
      patient.email,
      patient.phone,
      patient.address?.city,
      patient.address?.state,
    ].filter(Boolean).join(' ')
  };

  // if we get new data then perform add or update existing details if it is already there
  await this.findOneAndUpdate(
    { patientId: patient._id },
    readViewData,
    { upsert: true, new: true }
  );
}

/**
 * Delete read view
 */
patientReadViewSchema.statics.deleteByPatientId = async function (patientId) {
  await this.deleteOne({ patientId });
};

const PatientReadView = mongoose.model('PatientReadView', patientReadViewSchema);

module.exports = PatientReadView;               
