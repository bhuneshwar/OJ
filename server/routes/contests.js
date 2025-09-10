const express = require('express');
const { protect, authorize, optionalAuth, contestModerator } = require('../middleware/auth');

const {
  getContests,
  getUpcomingContests,
  getRunningContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
  unregisterFromContest,
  getLeaderboard,
  getContestProblems,
  getContestSubmissions,
  submitSolution,
  getClarifications,
  askClarification
} = require('../controllers/contestController');

const router = express.Router();

// @route   GET /api/contests
// @desc    Get all contests with filtering
// @access  Public
router.get('/', optionalAuth, getContests);

// @route   GET /api/contests/upcoming
// @desc    Get upcoming contests
// @access  Public
router.get('/upcoming', getUpcomingContests);

// @route   GET /api/contests/running
// @desc    Get currently running contests
// @access  Public
router.get('/running', getRunningContests);

// @route   GET /api/contests/:id
// @desc    Get contest details
// @access  Public
router.get('/:id', optionalAuth, getContest);

// @route   POST /api/contests
// @desc    Create new contest
// @access  Private/Admin
router.post('/', protect, authorize('admin', 'moderator'), createContest);

// @route   PUT /api/contests/:id
// @desc    Update contest
// @access  Private (Contest moderator or admin)
router.put('/:id', protect, updateContest);

// @route   DELETE /api/contests/:id
// @desc    Delete contest
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), deleteContest);

// @route   POST /api/contests/:id/register
// @desc    Register for contest
// @access  Private
router.post('/:id/register', protect, registerForContest);

// @route   POST /api/contests/:id/unregister
// @desc    Unregister from contest
// @access  Private
router.post('/:id/unregister', protect, unregisterFromContest);

// @route   GET /api/contests/:id/leaderboard
// @desc    Get contest leaderboard
// @access  Public
router.get('/:id/leaderboard', optionalAuth, getLeaderboard);

// @route   GET /api/contests/:id/problems
// @desc    Get contest problems
// @access  Private (Registered participants only)
router.get('/:id/problems', protect, getContestProblems);

// @route   GET /api/contests/:id/submissions
// @desc    Get contest submissions
// @access  Private
router.get('/:id/submissions', protect, getContestSubmissions);

// @route   POST /api/contests/:contestId/problems/:problemId/submit
// @desc    Submit solution during contest
// @access  Private (Registered participants only)
router.post('/:contestId/problems/:problemId/submit', protect, submitSolution);

// @route   GET /api/contests/:id/clarifications
// @desc    Get contest clarifications
// @access  Private (Registered participants)
router.get('/:id/clarifications', protect, getClarifications);

// @route   POST /api/contests/:id/clarifications
// @desc    Ask clarification
// @access  Private (Registered participants)
router.post('/:id/clarifications', protect, askClarification);

module.exports = router;
