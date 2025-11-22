require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'auth-service',
  mongodbURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db',
  
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
  jwtExpiration: process.env.JWT_EXPIRATION || '1h',
  jwtRefershSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key',
  jwtRefreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
};