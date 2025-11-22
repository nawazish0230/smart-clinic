const express = require('express');
const dotenv = require('dotenv');
const config = require('./src/config');
const logger = require('./src/utils/logger');

const authRoutes = require('./src/routes/auth.route');
const connectDatabase = require('./src/config/database');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

const startServer = async () => {
  try {
    await connectDatabase();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      logger.info(`Auth service is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1); // 0 for success, 1 for failure
  }
};

startServer();