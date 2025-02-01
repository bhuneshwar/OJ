const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { getLeaderboard } = require('../controllers/leaderboardController');

router.get('/leaderboard', verifyToken, getLeaderboard);

module.exports = router;
