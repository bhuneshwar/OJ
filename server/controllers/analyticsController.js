const User = require('../models/User');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');
const Submission = require('../models/Submission');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

// @desc    Get public platform statistics
// @route   GET /api/analytics/public
// @access  Public
const getPublicStats = asyncHandler(async (req, res, next) => {
  const [
    totalUsers,
    totalProblems,
    totalSubmissions,
    totalContests,
    publishedProblems,
    activeContests
  ] = await Promise.all([
    User.countDocuments(),
    Problem.countDocuments(),
    Submission.countDocuments(),
    Contest.countDocuments(),
    Problem.countDocuments({ status: 'published' }),
    Contest.countDocuments({ status: { $in: ['running', 'upcoming'] } })
  ]);

  // Get recent activity counts
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recentUsers, recentSubmissions] = await Promise.all([
    User.countDocuments({ createdAt: { $gte: last24h } }),
    Submission.countDocuments({ createdAt: { $gte: last24h } })
  ]);

  res.status(200).json({
    success: true,
    data: {
      platform: {
        totalUsers,
        totalProblems: publishedProblems,
        totalSubmissions,
        totalContests,
        activeContests
      },
      activity: {
        newUsersToday: recentUsers,
        submissionsToday: recentSubmissions
      },
      lastUpdated: new Date().toISOString()
    }
  });
});

// @desc    Get user analytics and statistics
// @route   GET /api/analytics/user/:id
// @access  Private (Own data or admin)
const getUserAnalytics = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;

  // Check if user can access this data
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this user data'
    });
  }

  const user = await User.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get user's submission statistics
  const submissionStats = await Submission.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get language usage
  const languageStats = await Submission.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get difficulty distribution of solved problems
  const solvedProblemsStats = await Submission.aggregate([
    { $match: { user: user._id, status: 'Accepted' } },
    {
      $lookup: {
        from: 'problems',
        localField: 'problem',
        foreignField: '_id',
        as: 'problemInfo'
      }
    },
    { $unwind: '$problemInfo' },
    {
      $group: {
        _id: '$problemInfo.difficulty',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get submission activity over time (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const submissionActivity = await Submission.aggregate([
    {
      $match: {
        user: user._id,
        createdAt: { $gte: thirtyDaysAgo }
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

  // Get contest participation
  const contestStats = await Contest.aggregate([
    { $match: { 'participants.user': user._id } },
    { $unwind: '$participants' },
    { $match: { 'participants.user': user._id } },
    {
      $group: {
        _id: null,
        totalContests: { $sum: 1 },
        avgRank: { $avg: '$participants.rank' },
        avgScore: { $avg: '$participants.score' },
        totalScore: { $sum: '$participants.score' }
      }
    }
  ]);

  // Get recent submissions
  const recentSubmissions = await Submission.find({ user: user._id })
    .populate('problem', 'title difficulty')
    .populate('contest', 'title')
    .sort({ createdAt: -1 })
    .limit(10);

  // Calculate streaks and achievements
  const achievements = await calculateUserAchievements(user._id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        username: user.username,
        rating: user.rating,
        rank: user.rank,
        joinDate: user.createdAt,
        lastActive: user.lastActive
      },
      statistics: {
        submissions: {
          total: user.submissions,
          accepted: user.acceptedSubmissions,
          acceptanceRate: user.submissions > 0 ? ((user.acceptedSubmissions / user.submissions) * 100).toFixed(1) : 0,
          byStatus: submissionStats
        },
        problems: {
          solved: user.problemsSolved,
          byDifficulty: solvedProblemsStats
        },
        contests: {
          participated: user.contestsParticipated,
          stats: contestStats[0] || {
            totalContests: 0,
            avgRank: 0,
            avgScore: 0,
            totalScore: 0
          }
        },
        languages: languageStats
      },
      activity: {
        submissionActivity,
        recentSubmissions
      },
      achievements
    }
  });
});

// Helper function to calculate user achievements
const calculateUserAchievements = async (userId) => {
  const achievements = [];

  // Get user's accepted submissions
  const acceptedSubmissions = await Submission.find({ user: userId, status: 'Accepted' })
    .populate('problem', 'difficulty tags')
    .sort({ createdAt: 1 });

  // First submission achievement
  if (acceptedSubmissions.length > 0) {
    achievements.push({
      name: 'First Blood',
      description: 'Solved your first problem',
      earnedAt: acceptedSubmissions[0].createdAt,
      icon: '🩸'
    });
  }

  // Problem count achievements
  const problemCounts = [10, 25, 50, 100, 250, 500, 1000];
  problemCounts.forEach(count => {
    if (acceptedSubmissions.length >= count) {
      achievements.push({
        name: `Problem Solver ${count}`,
        description: `Solved ${count} problems`,
        earnedAt: acceptedSubmissions[count - 1].createdAt,
        icon: '🏆'
      });
    }
  });

  // Difficulty achievements
  const difficulties = ['Easy', 'Medium', 'Hard'];
  for (const difficulty of difficulties) {
    const difficultyProblems = acceptedSubmissions.filter(s => s.problem.difficulty === difficulty);
    if (difficultyProblems.length >= 10) {
      achievements.push({
        name: `${difficulty} Master`,
        description: `Solved 10+ ${difficulty.toLowerCase()} problems`,
        earnedAt: difficultyProblems[9].createdAt,
        icon: difficulty === 'Hard' ? '👑' : difficulty === 'Medium' ? '🥈' : '🥉'
      });
    }
  }

  // Language diversity achievement
  const languages = [...new Set(acceptedSubmissions.map(s => s.language))];
  if (languages.length >= 3) {
    achievements.push({
      name: 'Polyglot',
      description: 'Solved problems in 3+ programming languages',
      icon: '🌍'
    });
  }

  return achievements.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));
};

// @desc    Get problem statistics
// @route   GET /api/analytics/problems
// @access  Private
const getProblemStats = asyncHandler(async (req, res, next) => {
  const { difficulty, tags, timeRange = '30d' } = req.query;

  // Calculate date range
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Build query
  let query = { status: 'published' };
  if (difficulty) query.difficulty = difficulty;
  if (tags) query.tags = { $in: tags.split(',') };

  // Get problem statistics
  const [
    totalProblems,
    difficultyDistribution,
    tagDistribution,
    submissionStats,
    topProblems
  ] = await Promise.all([
    Problem.countDocuments(query),
    Problem.aggregate([
      { $match: query },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Problem.aggregate([
      { $match: query },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]),
    getSubmissionStatsByProblems(query, startDate),
    Problem.aggregate([
      { $match: query },
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
          submissionCount: { $size: '$submissions' },
          acceptedCount: {
            $size: {
              $filter: {
                input: '$submissions',
                cond: { $eq: ['$$this.status', 'Accepted'] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          acceptanceRate: {
            $cond: {
              if: { $gt: ['$submissionCount', 0] },
              then: { $multiply: [{ $divide: ['$acceptedCount', '$submissionCount'] }, 100] },
              else: 0
            }
          }
        }
      },
      { $sort: { submissionCount: -1 } },
      { $limit: 10 }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalProblems,
        timeRange
      },
      distribution: {
        byDifficulty: difficultyDistribution,
        byTags: tagDistribution
      },
      submissions: submissionStats,
      topProblems
    }
  });
});

// Helper function to get submission stats by problems
const getSubmissionStatsByProblems = async (problemQuery, startDate) => {
  const problems = await Problem.find(problemQuery).select('_id');
  const problemIds = problems.map(p => p._id);

  const stats = await Submission.aggregate([
    {
      $match: {
        problem: { $in: problemIds },
        createdAt: { $gte: startDate }
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

// @desc    Get specific problem analytics
// @route   GET /api/analytics/problems/:id
// @access  Private/Admin
const getProblemAnalytics = asyncHandler(async (req, res, next) => {
  const problemId = req.params.id;

  const problem = await Problem.findById(problemId);
  if (!problem) {
    return res.status(404).json({
      success: false,
      message: 'Problem not found'
    });
  }

  // Get submission statistics
  const submissionStats = await Submission.aggregate([
    { $match: { problem: problem._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get language statistics
  const languageStats = await Submission.aggregate([
    { $match: { problem: problem._id } },
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 },
        avgTime: { $avg: '$executionTime' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get submission timeline (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const submissionTimeline = await Submission.aggregate([
    {
      $match: {
        problem: problem._id,
        createdAt: { $gte: thirtyDaysAgo }
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
        count: { $sum: 1 },
        accepted: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0]
          }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Get top performers
  const topPerformers = await Submission.aggregate([
    { $match: { problem: problem._id, status: 'Accepted' } },
    {
      $group: {
        _id: '$user',
        bestTime: { $min: '$executionTime' },
        submissions: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        username: '$user.username',
        rating: '$user.rating',
        bestTime: 1,
        submissions: 1
      }
    },
    { $sort: { bestTime: 1 } },
    { $limit: 10 }
  ]);

  const totalSubmissions = submissionStats.reduce((sum, stat) => sum + stat.count, 0);
  const acceptedSubmissions = submissionStats.find(s => s._id === 'Accepted')?.count || 0;

  res.status(200).json({
    success: true,
    data: {
      problem: {
        id: problem._id,
        title: problem.title,
        difficulty: problem.difficulty,
        tags: problem.tags
      },
      statistics: {
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate: totalSubmissions > 0 ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : 0,
        byStatus: submissionStats,
        byLanguage: languageStats
      },
      timeline: submissionTimeline,
      topPerformers
    }
  });
});

// @desc    Get contest statistics
// @route   GET /api/analytics/contests
// @access  Private
const getContestStats = asyncHandler(async (req, res, next) => {
  const { type, status, timeRange = '30d' } = req.query;

  // Calculate date range
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Build query
  let query = {};
  if (type) query.type = type;
  if (status) query.status = status;

  // Get contest statistics
  const [
    totalContests,
    typeDistribution,
    statusDistribution,
    participationStats,
    upcomingContests
  ] = await Promise.all([
    Contest.countDocuments(query),
    Contest.aggregate([
      { $match: query },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Contest.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Contest.aggregate([
      { $match: { ...query, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalParticipants: { $sum: { $size: '$participants' } },
          avgParticipants: { $avg: { $size: '$participants' } },
          totalContests: { $sum: 1 }
        }
      }
    ]),
    Contest.find({ status: 'upcoming', isVisible: true, isPublic: true })
      .populate('author', 'username')
      .sort({ startTime: 1 })
      .limit(5)
      .select('title type startTime endTime participantsCount')
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalContests,
        timeRange
      },
      distribution: {
        byType: typeDistribution,
        byStatus: statusDistribution
      },
      participation: participationStats[0] || {
        totalParticipants: 0,
        avgParticipants: 0,
        totalContests: 0
      },
      upcoming: upcomingContests
    }
  });
});

// @desc    Get specific contest analytics
// @route   GET /api/analytics/contests/:id
// @access  Private (Contest moderator or admin)
const getContestAnalytics = asyncHandler(async (req, res, next) => {
  const contestId = req.params.id;

  const contest = await Contest.findById(contestId)
    .populate('participants.user', 'username rating')
    .populate('problems.problem', 'title difficulty');

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // Check permissions
  const isAuthor = contest.author.toString() === req.user.id;
  const isModerator = contest.moderators.some(mod => mod.toString() === req.user.id);
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isModerator && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view contest analytics'
    });
  }

  // Calculate participation statistics
  const participationStats = {
    registered: contest.participants.length,
    submitted: contest.participants.filter(p => p.solvedProblems.some(sp => sp.submissions.length > 0)).length,
    solved: contest.participants.filter(p => p.solvedProblems.some(sp => sp.isSolved)).length
  };

  // Get problem statistics
  const problemStats = contest.problems.map(contestProblem => {
    const submissions = contest.participants.reduce((total, participant) => {
      const problemEntry = participant.solvedProblems.find(sp => 
        sp.problem.toString() === contestProblem.problem._id.toString()
      );
      return total + (problemEntry ? problemEntry.submissions.length : 0);
    }, 0);

    const solvers = contest.participants.filter(participant => {
      const problemEntry = participant.solvedProblems.find(sp => 
        sp.problem.toString() === contestProblem.problem._id.toString()
      );
      return problemEntry && problemEntry.isSolved;
    }).length;

    return {
      label: contestProblem.label,
      title: contestProblem.problem.title,
      difficulty: contestProblem.problem.difficulty,
      submissions,
      solvers,
      acceptanceRate: submissions > 0 ? ((solvers / submissions) * 100).toFixed(1) : 0
    };
  });

  // Get rating distribution of participants
  const ratingDistribution = contest.participants.reduce((dist, participant) => {
    const rating = participant.user.rating;
    let range;
    
    if (rating < 1200) range = '< 1200';
    else if (rating < 1400) range = '1200-1399';
    else if (rating < 1600) range = '1400-1599';
    else if (rating < 1900) range = '1600-1899';
    else if (rating < 2100) range = '1900-2099';
    else range = '2100+';

    dist[range] = (dist[range] || 0) + 1;
    return dist;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      contest: {
        id: contest._id,
        title: contest.title,
        type: contest.type,
        status: contest.status,
        startTime: contest.startTime,
        endTime: contest.endTime
      },
      participation: participationStats,
      problems: problemStats,
      ratingDistribution,
      leaderboard: contest.participants
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 20)
        .map(p => ({
          rank: p.rank,
          username: p.user.username,
          score: p.score,
          penalty: p.penalty
        }))
    }
  });
});

// @desc    Get programming language usage statistics
// @route   GET /api/analytics/language-stats
// @access  Public
const getLanguageStats = asyncHandler(async (req, res, next) => {
  const { period = '30d' } = req.query;

  // Calculate date range
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 30;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const languageStats = await Submission.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$language',
        total: { $sum: 1 },
        accepted: {
          $sum: {
            $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0]
          }
        },
        avgExecutionTime: { $avg: '$executionTime' }
      }
    },
    {
      $project: {
        language: '$_id',
        total: 1,
        accepted: 1,
        acceptanceRate: {
          $cond: {
            if: { $gt: ['$total', 0] },
            then: { $multiply: [{ $divide: ['$accepted', '$total'] }, 100] },
            else: 0
          }
        },
        avgExecutionTime: { $round: ['$avgExecutionTime', 2] }
      }
    },
    { $sort: { total: -1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      period,
      languages: languageStats
    }
  });
});

// @desc    Get global leaderboard analytics
// @route   GET /api/analytics/leaderboard
// @access  Public
const getLeaderboardAnalytics = asyncHandler(async (req, res, next) => {
  const { type = 'rating', limit = 100 } = req.query;

  let sortField;
  switch (type) {
    case 'rating':
      sortField = { rating: -1 };
      break;
    case 'problems':
      sortField = { problemsSolved: -1 };
      break;
    case 'submissions':
      sortField = { acceptedSubmissions: -1 };
      break;
    default:
      sortField = { rating: -1 };
  }

  const leaderboard = await User.find({ isActive: true })
    .select('username firstName lastName rating rank problemsSolved acceptedSubmissions contestsParticipated country institution')
    .sort(sortField)
    .limit(parseInt(limit));

  // Get distribution statistics
  const distributionStats = await User.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$rank',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      type,
      leaderboard,
      distribution: distributionStats,
      totalUsers: leaderboard.length
    }
  });
});

// @desc    Track custom analytics event
// @route   POST /api/analytics/track
// @access  Private
const trackEvent = asyncHandler(async (req, res, next) => {
  const { event, data = {} } = req.body;

  if (!event) {
    return res.status(400).json({
      success: false,
      message: 'Event name is required'
    });
  }

  // Log the event (in a real implementation, you might save this to a dedicated analytics collection)
  logger.info('Analytics Event:', {
    event,
    user: req.user ? req.user.username : 'anonymous',
    userId: req.user ? req.user.id : null,
    data,
    timestamp: new Date(),
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(200).json({
    success: true,
    message: 'Event tracked successfully'
  });
});

module.exports = {
  getPublicStats,
  getUserAnalytics,
  getProblemStats,
  getProblemAnalytics,
  getContestStats,
  getContestAnalytics,
  getLanguageStats,
  getLeaderboardAnalytics,
  trackEvent
};
