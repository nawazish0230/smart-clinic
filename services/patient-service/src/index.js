const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('express-async-errors');
require('dotenv').config();

// config and logger
const config = require('./config');
const connectDatabase = require('./config/database');
const logger = require('./utils/logger');

const patientRoutes = require('./routes/patient.route');
const healthRoutes = require('./routes/health.route');

const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');

const app = express();

// security middleware
app.use(cors());
app.use(helmet());

// parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/health', healthRoutes);
app.use('/api/patients', patientRoutes);


// middleware
app.use(notFoundHandler);
// error handler (must be last)
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`patient service running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    })
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
module.exports = app;