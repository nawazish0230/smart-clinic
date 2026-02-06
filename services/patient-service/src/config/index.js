require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'patient-service',

  // mongodb
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/patient_db',

  // Auth service (for token validation)
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',

  // logging
  logLevel: process.env.LOG_LEVEL || 'info',
};
