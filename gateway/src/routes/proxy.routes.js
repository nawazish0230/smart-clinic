const express = require('express');
const router = express.Router();

// middlewares and utilities
const config = require('../config');
const logger = require('../utils/logger');

const { createProxyMiddleware } = require('http-proxy-middleware');
const { authenticate } = require('../middlewares/auth.middleware')
const { generalRateLimiter, authRateLimiter } = require('../middlewares/rateLimiter.middleware');

/**
 * Proxy configuration factory
 */
const createProxyConfig = (target, pathRewrite = {}) => ({
  target,
  changeOrigin: true,
  pathRewrite,
  onProxyReq: (proxyReq, req) => {
    console.log(`[gateway] Proxying ${req.method} ${req.originalUrl} -> ${target}`);
    if (req.correlationId) {
      proxyReq.setHeader('X-Correlation-ID', req.correlationId);
    }
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.userId);
      proxyReq.setHeader('X-User-Email', req.user.email);
    }

    logger.info('Proxying request', {
      target,
      path: req.path,
      method: req.method,
      correlationId: req.correlationId,
    });
  },
  onProxyRes: (proxyRes, req, res) => {
    logger.info('Proxy response received', {
      target,
      path: req.path,
      statusCode: proxyRes.statusCode,
      correlationId: req.correlationId,
    });
  },
  onError: (err, req, res) => {
    logger.error('Proxy error', {
      target,
      path: req.path,
      error: err.message,
      correlationId: req.correlationId,
    });

    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      correlationId: req.correlationId,
    })
  },
  timeout: config.requestTimeout
})

/**
 * Auth Service Proxy
 */
router.use('/auth',
  authRateLimiter, // stricter rate limiting for auth endpoints
  createProxyMiddleware(createProxyConfig(config.services.auth.url, {
    '^/auth': '/api/auth', // keep the path as is
  }))
);


/**
 * Patient Service Proxy
 */
router.use('/patients',
  authenticate,  // all patient endpoints require authentication
  generalRateLimiter,
  createProxyMiddleware(createProxyConfig(config.services.patient.url, {
    '^/patients': '/api/patients',
  }))
);



module.exports = router;