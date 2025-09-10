const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const {
  getDashboard,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getProblems,
  updateProblemStatus,
  getContests,
  getSubmissions,
  rejudgeSubmission,
  getStatistics,
  getSystemHealth,
  getSystemLogs,
  triggerBackup
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', getDashboard);

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Private/Admin
router.get('/users', getUsers);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', updateUserRole);

// @route   PUT /api/admin/users/:id/status
// @desc    Update user account status (activate/deactivate)
// @access  Private/Admin
router.put('/users/:id/status', updateUserStatus);

// @route   GET /api/admin/problems
// @desc    Get all problems for admin management
// @access  Private/Admin
router.get('/problems', getProblems);

// @route   PUT /api/admin/problems/:id/status
// @desc    Update problem status (draft/published/archived)
// @access  Private/Admin
router.put('/problems/:id/status', updateProblemStatus);

// @route   GET /api/admin/contests
// @desc    Get all contests for admin management
// @access  Private/Admin
router.get('/contests', getContests);

// @route   GET /api/admin/submissions
// @desc    Get all submissions for admin review
// @access  Private/Admin
router.get('/submissions', getSubmissions);

// @route   POST /api/admin/submissions/:id/rejudge
// @desc    Rejudge specific submission
// @access  Private/Admin
router.post('/submissions/:id/rejudge', rejudgeSubmission);

// @route   GET /api/admin/statistics
// @desc    Get platform statistics
// @access  Private/Admin
router.get('/statistics', getStatistics);

// @route   GET /api/admin/system/health
// @desc    Get system health status
// @access  Private/Admin
router.get('/system/health', getSystemHealth);

// @route   GET /api/admin/system/logs
// @desc    Get system logs
// @access  Private/Admin
router.get('/system/logs', getSystemLogs);

// @route   POST /api/admin/system/backup
// @desc    Trigger system backup
// @access  Private/Admin
router.post('/system/backup', triggerBackup);

// @route   GET /api/admin/announcements
// @desc    Get all announcements
// @access  Private/Admin
router.get('/announcements', (req, res) => {
  res.json({ message: 'Get all announcements' });
});

// @route   POST /api/admin/announcements
// @desc    Create new announcement
// @access  Private/Admin
router.post('/announcements', (req, res) => {
  res.json({ 
    message: 'Create new announcement',
    title: req.body.title
  });
});

// @route   PUT /api/admin/announcements/:id
// @desc    Update announcement
// @access  Private/Admin
router.put('/announcements/:id', (req, res) => {
  res.json({ 
    message: `Update announcement ID: ${req.params.id}`
  });
});

// @route   DELETE /api/admin/announcements/:id
// @desc    Delete announcement
// @access  Private/Admin
router.delete('/announcements/:id', (req, res) => {
  res.json({ 
    message: `Delete announcement ID: ${req.params.id}`
  });
});

module.exports = router;
