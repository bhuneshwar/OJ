require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Online Judge API Test Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      problems: '/api/problems',
      submissions: '/api/submissions',
      contests: '/api/contests',
      admin: '/api/admin',
      analytics: '/api/analytics'
    }
  });
});

// Test authentication route
app.post('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication endpoint test',
    receivedData: req.body
  });
});

// Test protected route simulation
app.get('/api/test/protected', (req, res) => {
  res.json({
    success: true,
    message: 'Protected route test (simulation)',
    note: 'In production, this would require authentication'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Test server running on port ${PORT}`);
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('Test endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/status`);
  console.log(`  POST http://localhost:${PORT}/api/auth/test`);
  console.log(`  GET  http://localhost:${PORT}/api/test/protected`);
});

module.exports = app;
