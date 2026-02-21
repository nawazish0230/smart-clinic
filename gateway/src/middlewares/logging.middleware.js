const logger = require('../utils/logger');

/***
 * Request logging middleware
 * Logs all incoming requests with correlation ID
 */

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  console.log(`[gateway] Incoming: ${req.method} ${req.originalUrl}`);

  // Log request (use info so it shows when LOG_LEVEL=info)
  logger.info('Incoming request', {
    correlationId: req.correlationId,
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    ip: req.ip,
  });

  // Log when response is finished (res, not req)
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logLevel]('Request completed', {
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
      user: req.user ? req.user.id : 'anonymous'
    });
  });

  next();
}

module.exports = requestLogger;