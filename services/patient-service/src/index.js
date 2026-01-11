const express = require('express');
const app = express();
const patientRoutes = require('./routes/patient.route');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const connectDatabase = require('./config/database');
const config = require('./config');
const logger = require('./utils/logger');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

app.use('/api/patient', patientRoutes);

connectDatabase();

app.listen(config.port, () => {
  logger.info(`Patient service is running on port ${config.port}`);
})

module.exports = app;