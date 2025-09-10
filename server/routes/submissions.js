const express = require('express');
const { protect, authorize, ownerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Import submission controller (to be created)
// const { ... } = require('../controllers/submissionController');

// All routes require authentication
router.use(protect);

// @route   GET /api/submissions
// @desc    Get all submissions with filtering
// @access  Private
router.get('/', (req, res) => {
  res.json({ 
    message: 'Get all submissions with filtering',
    query: req.query,
    user: req.user.username
  });
});

// @route   GET /api/submissions/:id
// @desc    Get submission details
// @access  Private (Own submission or admin)
router.get('/:id', (req, res) => {
  res.json({ 
    message: `Get submission details for ID: ${req.params.id}`,
    user: req.user.username
  });
});

// @route   POST /api/submissions
// @desc    Create new submission
// @access  Private
router.post('/', (req, res) => {
  res.json({ 
    message: 'Create new submission',
    user: req.user.username,
    body: req.body
  });
});

// @route   DELETE /api/submissions/:id
// @desc    Delete submission (admin only)
// @access  Private/Admin
router.delete('/:id', authorize('admin'), (req, res) => {
  res.json({ message: `Delete submission ID: ${req.params.id}` });
});

// @route   GET /api/submissions/:id/result
// @desc    Get submission result/verdict
// @access  Private (Own submission or admin)
router.get('/:id/result', (req, res) => {
  res.json({ 
    message: `Get result for submission ID: ${req.params.id}`,
    user: req.user.username
  });
});

// @route   POST /api/submissions/:id/rejudge
// @desc    Rejudge submission (admin only)
// @access  Private/Admin
router.post('/:id/rejudge', authorize('admin', 'moderator'), (req, res) => {
  res.json({ message: `Rejudge submission ID: ${req.params.id}` });
});

// @route   GET /api/submissions/recent
// @desc    Get recent public submissions
// @access  Private
router.get('/recent', (req, res) => {
  res.json({ message: 'Get recent public submissions' });
});

// @route   GET /api/submissions/status/:submissionId
// @desc    Get live submission status (for polling)
// @access  Private (Own submission or admin)
router.get('/status/:submissionId', (req, res) => {
  res.json({ 
    message: `Get live status for submission ID: ${req.params.submissionId}`,
    status: 'Running' // Example status
  });
});

module.exports = router;
