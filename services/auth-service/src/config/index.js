require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'auth-service',
  mongodbURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db',
  
  jwtSecret: process.env.JWT_SECRET || 'your_secret_key',
  jwtExpireIn: process.env.JWT_EXPIRE_IN || '1h',
  jwtRefershSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-jwt-key',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};