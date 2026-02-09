const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('express-async-errors')
require('dotenv').config();

const config = require('./config');
const logger = require('./utils/logger');
// const { stitchRemoteSchemas } = require('./graphql/stichSchema')
const typeDefs = require('./graphql/schema');
const createResolvers = require('./graphql/resolvers');
const createContext = require('./graphql/context');

// Middleware
const correlationMiddleware = require('./middlewares/correlation.middleware');
const requestLogger = require('./middlewares/logging.middleware');
const { generalRateLimiter, qraphqlRateLimiter } = require('./middlewares/rateLimiter.middleware');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

// Routes
const helthRoutes = require('./routes/health.routes');
const proxyRoutes = require('./routes/proxy.routes');

// Services
const { createServiceClients } = require('./services/serviceClient');

// Create Express app
const app = express();

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'productiion' ? undefined : false
}))
app.use(cors(config.cors));
app.use(compression());

// body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Correlation ID middleware
app.use(correlationMiddleware);

// Request logging middleware
app.use(requestLogger);

// health checj routes (no rate limiting)
app.use('/health', helthRoutes);

// API routes with rate limiting
app.use('/api', generalRateLimiter, proxyRoutes);

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: createContext,
  introspection: config.nodeEnv !== 'production',
  playground: config.nodeEnv !== 'production',
})

const initializeApolloServer = async () => {
  // Initialize Apollo Server
  await apolloServer.start();
  // GraphQL endpoint
  apolloServer.applyMiddleware({ app, path: '/graphql' });
}

// 404 handler
app.use(notFound);

// error handle
app.use(errorHandler);

// Start the server
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

// start the server
startServer();

module.exports = app;
