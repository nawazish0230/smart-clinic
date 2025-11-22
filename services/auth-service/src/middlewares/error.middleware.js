const logger = require('../utils/logger');

/**
 * 
 * @param {Global error handling middleware} err 
 */
const errorMiddleware = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    status: res.statusCode,
    path: req.originalUrl,
    method: req.method,
  });

  // default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // mongoose validation error response
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message);
  }

  // mongoose duplicate key err response
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue);
    message = `Duplicate ${field.join(', ')} entered`;
  }

  // mongoose cast error response
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 
 * @param {Error handling middleware} err 
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
}

module.exports = {
  errorMiddleware,
  notFoundHandler
}