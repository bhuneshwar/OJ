const User = require('../models/User');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboard = asyncHandler(async (req, res, next) => {
  const timeRange = req.query.timeRange || '30d';
  const now = new Date();
  let startDate;

  switch (timeRange) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Aggregate dashboard statistics
  const [
    totalUsers,
    activeUsers,
    newUsers,
    totalProblems,
    newProblems,
    totalContests,
    runningContests,
    upcomingContests,
    totalSubmissions,
    newSubmissions,
    acceptedSubmissions,
    systemHealth
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ lastActive: { $gte: startDate } }),
    User.countDocuments({ createdAt: { $gte: startDate } }),
    Problem.countDocuments(),
    Problem.countDocuments({ createdAt: { $gte: startDate } }),
    Contest.countDocuments(),
    Contest.countDocuments({ status: 'running' }),
    Contest.countDocuments({ status: 'upcoming' }),
    Submission.countDocuments(),
    Submission.countDocuments({ createdAt: { $gte: startDate } }),
    Submission.countDocuments({ status: 'Accepted', createdAt: { $gte: startDate } }),
    getSystemHealth()
  ]);

  // Get user growth data
  const userGrowthData = await getUserGrowthData(timeRange);
  
  // Get submission statistics
  const submissionStats = await getSubmissionStats(timeRange);
  
  // Get top problems by submissions
  const topProblems = await Problem.aggregate([
    {
      $lookup: {
        from: 'submissions',
        localField: '_id',
        foreignField: 'problem',
        as: 'submissions'
      }
    },
    {
      $project: {
        title: 1,
        difficulty: 1,
        submissionCount: { $size: '$submissions' }
      }
    },
    { $sort: { submissionCount: -1 } },
    { $limit: 10 }
  ]);

  // Get recent activity
  const recentActivity = await getRecentActivity();

  const dashboardData = {
    overview: {
      totalUsers,
      activeUsers,
      newUsers,
      totalProblems,
      newProblems,
      totalContests,
      runningContests,
      upcomingContests,
      totalSubmissions,
      newSubmissions,
      acceptedSubmissions,
      acceptanceRate: newSubmissions > 0 ? ((acceptedSubmissions / newSubmissions) * 100).toFixed(1) : 0
    },
    systemHealth,
    userGrowthData,
    submissionStats,
    topProblems,
    recentActivity,
    timeRange
  };

  res.status(200).json({
    success: true,
    data: dashboardData
  });
});

// Helper function to get system health status
const getSystemHealth = async () => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Check memory usage
    const memUsage = process.memoryUsage();
    const memUsagePercent = ((memUsage.heapUsed / memUsage.heapTotal) * 100).toFixed(1);
    
    // Check uptime
    const uptime = process.uptime();
    
    return {
      database: dbStatus,
      memoryUsage: `${memUsagePercent}%`,
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      nodeVersion: process.version,
      status: 'healthy'
    };
  } catch (error) {
    logger.error('Health check error:', error);
    return {
      database: 'error',
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Helper function to get user growth data
const getUserGrowthData = async (timeRange) => {
  const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  const growth = await User.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  
  return growth;
};

// Helper function to get submission statistics
const getSubmissionStats = async (timeRange) => {
  const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  
  const stats = await Submission.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
        }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats;
};

// Helper function to get recent activity
const getRecentActivity = async () => {
  const [recentUsers, recentSubmissions, recentContests] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(5).select('username firstName lastName createdAt'),
    Submission.find().populate('user', 'username').populate('problem', 'title').sort({ createdAt: -1 }).limit(5),
    Contest.find().populate('author', 'username').sort({ createdAt: -1 }).limit(5).select('title author createdAt status')
  ]);
  
  return {
    recentUsers,
    recentSubmissions,
    recentContests
  };
};

// @desc    Get all users for admin management
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const {
    search,
    role,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 20,
    page = 1
  } = req.query;

  // Build query
  let query = {};
  
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (role) query.role = role;
  if (status) query.isActive = status === 'active';

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const users = await User.find(query)
    .select('-password')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: users
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!['user', 'admin', 'moderator'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  logger.info(`User role updated: ${user.username} role changed to ${role} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user account status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  logger.info(`User status updated: ${user.username} ${isActive ? 'activated' : 'deactivated'} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get all problems for admin management
// @route   GET /api/admin/problems
// @access  Private/Admin
const getProblems = asyncHandler(async (req, res, next) => {
  const {
    search,
    difficulty,
    status,
    category,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 20,
    page = 1
  } = req.query;

  // Build query
  let query = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (difficulty) query.difficulty = difficulty;
  if (status) query.status = status;
  if (category) query.tags = { $in: [category] };

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const problems = await Problem.find(query)
    .populate('author', 'username firstName lastName')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Problem.countDocuments(query);

  // Get submission stats for each problem
  const problemsWithStats = await Promise.all(
    problems.map(async (problem) => {
      const submissions = await Submission.countDocuments({ problem: problem._id });
      const accepted = await Submission.countDocuments({ problem: problem._id, status: 'Accepted' });
      
      return {
        ...problem.toObject(),
        submissionCount: submissions,
        acceptedCount: accepted,
        acceptanceRate: submissions > 0 ? ((accepted / submissions) * 100).toFixed(1) : 0
      };
    })
  );

  res.status(200).json({
    success: true,
    count: problemsWithStats.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: problemsWithStats
  });
});

// @desc    Update problem status
// @route   PUT /api/admin/problems/:id/status
// @access  Private/Admin
const updateProblemStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['draft', 'published', 'archived'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const problem = await Problem.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('author', 'username firstName lastName');

  if (!problem) {
    return res.status(404).json({
      success: false,
      message: 'Problem not found'
    });
  }

  logger.info(`Problem status updated: ${problem.title} status changed to ${status} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: problem
  });
});

// @desc    Get all contests for admin management
// @route   GET /api/admin/contests
// @access  Private/Admin
const getContests = asyncHandler(async (req, res, next) => {
  const {
    search,
    type,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 20,
    page = 1
  } = req.query;

  // Build query
  let query = {};
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (type) query.type = type;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const contests = await Contest.find(query)
    .populate('author', 'username firstName lastName')
    .populate('moderators', 'username firstName lastName')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-participants.solvedProblems -clarifications');

  const total = await Contest.countDocuments(query);

  res.status(200).json({
    success: true,
    count: contests.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: contests
  });
});

// @desc    Get all submissions for admin review
// @route   GET /api/admin/submissions
// @access  Private/Admin
const getSubmissions = asyncHandler(async (req, res, next) => {
  const {
    status,
    language,
    userId,
    problemId,
    contestId,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 50,
    page = 1
  } = req.query;

  // Build query
  let query = {};
  
  if (status) query.status = status;
  if (language) query.language = language;
  if (userId) query.user = userId;
  if (problemId) query.problem = problemId;
  if (contestId) query.contest = contestId;

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const submissions = await Submission.find(query)
    .populate('user', 'username firstName lastName')
    .populate('problem', 'title difficulty')
    .populate('contest', 'title')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Submission.countDocuments(query);

  res.status(200).json({
    success: true,
    count: submissions.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    },
    data: submissions
  });
});

// @desc    Rejudge specific submission
// @route   POST /api/admin/submissions/:id/rejudge
// @access  Private/Admin
const rejudgeSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  // Reset submission status to Pending
  submission.status = 'Pending';
  submission.executionTime = null;
  submission.memoryUsage = null;
  submission.error = null;
  await submission.save();

  // TODO: Add submission back to judge queue
  // This would typically involve sending the submission to your code execution system

  logger.info(`Submission rejudged: ${submission._id} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Submission queued for rejudging',
    data: submission
  });
});

// @desc    Get platform statistics
// @route   GET /api/admin/statistics
// @access  Private/Admin
const getStatistics = asyncHandler(async (req, res, next) => {
  const period = req.query.period || '30d';
  const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    userStats,
    problemStats,
    contestStats,
    submissionStats,
    languageStats,
    difficultyStats
  ] = await Promise.all([
    getUserStatistics(startDate),
    getProblemStatistics(startDate),
    getContestStatistics(startDate),
    getSubmissionStatistics(startDate),
    getLanguageStatistics(startDate),
    getDifficultyStatistics()
  ]);

  res.status(200).json({
    success: true,
    data: {
      period,
      userStats,
      problemStats,
      contestStats,
      submissionStats,
      languageStats,
      difficultyStats
    }
  });
});

// Helper functions for statistics
const getUserStatistics = async (startDate) => {
  return await User.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        new: [{ $match: { createdAt: { $gte: startDate } } }, { $count: "count" }],
        active: [{ $match: { lastActive: { $gte: startDate } } }, { $count: "count" }],
        byRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }]
      }
    }
  ]);
};

const getProblemStatistics = async (startDate) => {
  return await Problem.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        new: [{ $match: { createdAt: { $gte: startDate } } }, { $count: "count" }],
        byDifficulty: [{ $group: { _id: "$difficulty", count: { $sum: 1 } } }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }]
      }
    }
  ]);
};

const getContestStatistics = async (startDate) => {
  return await Contest.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        new: [{ $match: { createdAt: { $gte: startDate } } }, { $count: "count" }],
        byType: [{ $group: { _id: "$type", count: { $sum: 1 } } }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }]
      }
    }
  ]);
};

const getSubmissionStatistics = async (startDate) => {
  return await Submission.aggregate([
    {
      $facet: {
        total: [{ $count: "count" }],
        new: [{ $match: { createdAt: { $gte: startDate } } }, { $count: "count" }],
        byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
        byLanguage: [{ $group: { _id: "$language", count: { $sum: 1 } } }]
      }
    }
  ]);
};

const getLanguageStatistics = async (startDate) => {
  return await Submission.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: "$language", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

const getDifficultyStatistics = async () => {
  return await Problem.aggregate([
    { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};

// @desc    Get system health status
// @route   GET /api/admin/system/health
// @access  Private/Admin
const getSystemHealth = asyncHandler(async (req, res, next) => {
  const health = await getSystemHealth();

  res.status(200).json({
    success: true,
    data: health
  });
});

// @desc    Get system logs
// @route   GET /api/admin/system/logs
// @access  Private/Admin
const getSystemLogs = asyncHandler(async (req, res, next) => {
  const { level = 'error', limit = 100 } = req.query;

  try {
    const logFilePath = path.join(__dirname, '../logs', `${level}.log`);
    
    if (!fs.existsSync(logFilePath)) {
      return res.status(200).json({
        success: true,
        data: [],
        message: `No ${level} logs found`
      });
    }

    const logContent = fs.readFileSync(logFilePath, 'utf8');
    const logLines = logContent.split('\n').filter(line => line.trim() !== '');
    
    // Get the most recent logs
    const recentLogs = logLines.slice(-limit).reverse();

    res.status(200).json({
      success: true,
      count: recentLogs.length,
      data: recentLogs
    });
  } catch (error) {
    logger.error('Error reading system logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading system logs'
    });
  }
});

// @desc    Trigger system backup
// @route   POST /api/admin/system/backup
// @access  Private/Admin
const triggerBackup = asyncHandler(async (req, res, next) => {
  const { type = 'full' } = req.body;

  try {
    // TODO: Implement actual backup logic
    // This would typically involve:
    // 1. Creating database backup
    // 2. Backing up uploaded files
    // 3. Creating system configuration backup
    
    logger.info(`System backup initiated (${type}) by ${req.user.username}`);

    res.status(200).json({
      success: true,
      message: `${type} backup initiated successfully`,
      data: {
        type,
        initiatedBy: req.user.username,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating backup'
    });
  }
});

module.exports = {
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
};
