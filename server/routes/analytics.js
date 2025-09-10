const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const {
  getPublicStats,
  getUserAnalytics,
  getProblemStats,
  getProblemAnalytics,
  getContestStats,
  getContestAnalytics,
  getLanguageStats,
  getLeaderboardAnalytics,
  trackEvent
} = require('../controllers/analyticsController');

const router = express.Router();

// @route   GET /api/analytics/public
// @desc    Get public platform statistics
// @access  Public
router.get('/public', getPublicStats);

// @route   GET /api/analytics/user/:id
// @desc    Get user analytics and statistics
// @access  Private (Own data or admin)
router.get('/user/:id', protect, getUserAnalytics);

// @route   GET /api/analytics/problems
// @desc    Get problem statistics
// @access  Private
router.get('/problems', protect, getProblemStats);

// @route   GET /api/analytics/problems/:id
// @desc    Get specific problem analytics
// @access  Private/Admin
router.get('/problems/:id', protect, authorize('admin', 'moderator'), getProblemAnalytics);

// @route   GET /api/analytics/contests
// @desc    Get contest statistics
// @access  Private
router.get('/contests', protect, getContestStats);

// @route   GET /api/analytics/contests/:id
// @desc    Get specific contest analytics
// @access  Private (Contest moderator or admin)
router.get('/contests/:id', protect, getContestAnalytics);

// @route   GET /api/analytics/language-stats
// @desc    Get programming language usage statistics
// @access  Public
router.get('/language-stats', getLanguageStats);

// @route   GET /api/analytics/leaderboard
// @desc    Get global leaderboard analytics
// @access  Public
router.get('/leaderboard', getLeaderboardAnalytics);

// @route   POST /api/analytics/track
// @desc    Track custom analytics event
// @access  Private
router.post('/track', optionalAuth, trackEvent);

module.exports = router;
