const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'Worker is running' });
});

module.exports = router; 