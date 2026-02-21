const express = require('express');
const dotenv = require('dotenv');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const swaggerUI = require('swagger-ui-express');
const swaggerSepc = require('./config/swagger');

const authRoutes = require('./routes/auth.route');
const healthRoutes = require('./routes/health.route');
const connectDatabase = require('./config/database');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Swagger UI
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(
  swaggerSepc, {
  customCSS: '.swagger-ui .topbar { display: none }',
  customSiteTitle: `${config.serviceName} API Docs`,
}
));

app.use('/health', healthRoutes);
app.use('/api/auth', authRoutes);

// 404 not found handler
app.use(notFoundHandler);

// global error handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      logger.info(`Auth service is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1); // 0 for success, 1 for failure
  }
};

startServer();
