const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Import problem controller (to be created)
// const { ... } = require('../controllers/problemController');

// @route   GET /api/problems
// @desc    Get all problems with optional filtering
// @access  Public
router.get('/', optionalAuth, (req, res) => {
  res.json({ 
    message: 'Get all problems with filtering',
    query: req.query,
    user: req.user ? req.user.username : 'Anonymous'
  });
});

// @route   GET /api/problems/:id
// @desc    Get single problem details
// @access  Public
router.get('/:id', optionalAuth, (req, res) => {
  res.json({ 
    message: `Get problem details for ID: ${req.params.id}`,
    user: req.user ? req.user.username : 'Anonymous'
  });
});

// @route   POST /api/problems
// @desc    Create new problem
// @access  Private/Admin
router.post('/', protect, authorize('admin', 'moderator'), (req, res) => {
  res.json({ message: 'Create new problem' });
});

// @route   PUT /api/problems/:id
// @desc    Update problem
// @access  Private/Admin
router.put('/:id', protect, authorize('admin', 'moderator'), (req, res) => {
  res.json({ message: `Update problem ID: ${req.params.id}` });
});

// @route   DELETE /api/problems/:id
// @desc    Delete problem
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), (req, res) => {
  res.json({ message: `Delete problem ID: ${req.params.id}` });
});

// @route   GET /api/problems/:id/submissions
// @desc    Get problem submissions
// @access  Private
router.get('/:id/submissions', protect, (req, res) => {
  res.json({ message: `Get submissions for problem ID: ${req.params.id}` });
});

// @route   POST /api/problems/:id/submit
// @desc    Submit solution to problem
// @access  Private
router.post('/:id/submit', protect, (req, res) => {
  res.json({ message: `Submit solution for problem ID: ${req.params.id}` });
});

// @route   GET /api/problems/:id/editorial
// @desc    Get problem editorial
// @access  Private
router.get('/:id/editorial', protect, (req, res) => {
  res.json({ message: `Get editorial for problem ID: ${req.params.id}` });
});

// @route   GET /api/problems/:id/discussion
// @desc    Get problem discussion
// @access  Public
router.get('/:id/discussion', optionalAuth, (req, res) => {
  res.json({ message: `Get discussion for problem ID: ${req.params.id}` });
});

module.exports = router;
