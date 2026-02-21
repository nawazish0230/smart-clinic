const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

router.get('/ready', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'auth-service',
    status: 'ready',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

module.exports = router;    