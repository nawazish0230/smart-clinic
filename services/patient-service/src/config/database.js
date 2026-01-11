const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB database
 * @param {string} uri - MongoDB connection URI
 * @returns {Promise<void>}
 */
const connectDatabase = async (uri) => {
  try {
    const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/patient_db';
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    await mongoose.connect(mongodbUri, options);

    logger.info(`Connecting to MongoDB database at ${mongodbUri}`);

    mongoose.connection.on('connected', () => {
      logger.info('Connected to MongoDB database');
    });
    mongoose.connection.on('error', (error) => {
      logger.error('Failed to connect to MongoDB database', error);
      process.exit(1);
    });
    mongoose.connection.on('disconnected', () => {
      logger.info('Disconnected from MongoDB database');
      process.exit(1);
    });
    mongoose.connection.on('reconnected', () => {
      logger.info('Reconnected to MongoDB database');
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB database', error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
