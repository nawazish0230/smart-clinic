const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('express-async-errors');
require('dotenv').config();

// graphql imports
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const createContext = require('./graphql/context');

// config and logger
const config = require('./config');
const connectDatabase = require('./config/database');
const logger = require('./utils/logger');

// kafka import
const { initializeProducer, shutdownProducer } = require('./utils/eventProducer');

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

// graphql apollo server setup
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
  introspection: config.nodeEnv !== 'production',
  playground: config.nodeEnv !== 'production',
})

app.use('/health', healthRoutes);
app.use('/api/patients', patientRoutes);


// middleware
// app.use(notFoundHandler);
// // error handler (must be last)
// app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    // initialize kafka (Event-Driven)
    await initializeProducer()

    // start apollo server
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/graphql' });

    // start express server
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`patient service running on port ${PORT}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Kafka running on ${process.env.KAFKA_BROKERS || 'localhost:9092'}`);
    })
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received. Shutting down gracefully...');
  await shutdownProducer();
  process.exit(0);
});

process.on('unhandledRejection', async (err) => {
  logger.error('Unhandled rejection detected', err.message);
  process.exit(1);
});

process.on('uncaughtException', async (error) => {
  logger.error('Uncaught exception detected', error.message);
  process.exit(1);
});

startServer();
module.exports = app;