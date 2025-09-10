const express = require('express');
const { protect, authorize, ownerOrAdmin } = require('../middleware/auth');

const router = express.Router();

// Import user controller (to be created)
// const { ... } = require('../controllers/userController');

// All routes require authentication
router.use(protect);

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authorize('admin'), (req, res) => {
  res.json({ message: 'Get all users - Admin only' });
});

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Private
router.get('/:id', (req, res) => {
  res.json({ message: `Get user profile for ID: ${req.params.id}` });
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (Own profile or admin)
router.put('/:id', ownerOrAdmin, (req, res) => {
  res.json({ message: `Update user profile for ID: ${req.params.id}` });
});

// @route   DELETE /api/users/:id
// @desc    Delete user account
// @access  Private/Admin
router.delete('/:id', authorize('admin'), (req, res) => {
  res.json({ message: `Delete user account for ID: ${req.params.id}` });
});

// @route   GET /api/users/:id/submissions
// @desc    Get user submissions
// @access  Private
router.get('/:id/submissions', (req, res) => {
  res.json({ message: `Get submissions for user ID: ${req.params.id}` });
});

// @route   GET /api/users/:id/statistics
// @desc    Get user statistics
// @access  Private
router.get('/:id/statistics', (req, res) => {
  res.json({ message: `Get statistics for user ID: ${req.params.id}` });
});

module.exports = router;
