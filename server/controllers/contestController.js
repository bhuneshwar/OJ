const Contest = require('../models/Contest');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

// @desc    Get all contests with filtering
// @route   GET /api/contests
// @access  Public
const getContests = asyncHandler(async (req, res, next) => {
  const {
    status,
    type,
    difficulty,
    upcoming,
    running,
    past,
    search,
    limit = 20,
    page = 1,
    sortBy = 'startTime',
    sortOrder = 'asc'
  } = req.query;

  // Build query
  let query = { isVisible: true, isPublic: true };

  // Status filters
  if (status) query.status = status;
  if (upcoming) query.status = 'upcoming';
  if (running) query.status = 'running';
  if (past) query.status = 'ended';

  // Type and difficulty filters
  if (type) query.type = type;
  if (difficulty) query.difficulty = difficulty;

  // Search in title and description
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const contests = await Contest.find(query)
    .populate('author', 'username firstName lastName')
    .populate('problems.problem', 'title difficulty tags')
    .populate('moderators', 'username firstName lastName')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-clarifications -ratingChanges -participants.solvedProblems');

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

// @desc    Get upcoming contests
// @route   GET /api/contests/upcoming
// @access  Public
const getUpcomingContests = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const contests = await Contest.getUpcomingContests(limit);

  res.status(200).json({
    success: true,
    count: contests.length,
    data: contests
  });
});

// @desc    Get currently running contests
// @route   GET /api/contests/running
// @access  Public
const getRunningContests = asyncHandler(async (req, res, next) => {
  const contests = await Contest.getRunningContests();

  res.status(200).json({
    success: true,
    count: contests.length,
    data: contests
  });
});

// @desc    Get contest details
// @route   GET /api/contests/:id
// @access  Public
const getContest = asyncHandler(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id)
    .populate('author', 'username firstName lastName rating')
    .populate('problems.problem', 'title difficulty tags timeLimit memoryLimit')
    .populate('moderators', 'username firstName lastName')
    .populate('clarifications.askedBy', 'username')
    .populate('clarifications.answeredBy', 'username');

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // Check visibility permissions
  if (!contest.isVisible && (!req.user || req.user.role !== 'admin')) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // Check if user is registered (if authenticated)
  let isRegistered = false;
  let userStats = null;
  
  if (req.user) {
    const participant = contest.participants.find(
      p => p.user.toString() === req.user.id
    );
    
    if (participant) {
      isRegistered = true;
      userStats = {
        rank: participant.rank,
        score: participant.score,
        penalty: participant.penalty,
        solvedCount: participant.solvedProblems.filter(p => p.isSolved).length,
        lastSubmissionTime: participant.lastSubmissionTime
      };
    }
  }

  // Filter clarifications for non-participants
  let clarifications = contest.clarifications;
  if (!isRegistered && req.user?.role !== 'admin') {
    clarifications = contest.clarifications.filter(c => c.isPublic);
  }

  res.status(200).json({
    success: true,
    data: {
      ...contest.toObject(),
      clarifications,
      isRegistered,
      userStats,
      canRegister: contest.registrationStatus === 'open' && 
                   !isRegistered && 
                   (contest.maxParticipants === 0 || contest.participantsCount < contest.maxParticipants)
    }
  });
});

// @desc    Create new contest
// @route   POST /api/contests
// @access  Private/Admin
const createContest = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    rules,
    type,
    difficulty,
    startTime,
    endTime,
    duration,
    freezeTime,
    problems,
    maxParticipants,
    registrationStart,
    registrationEnd,
    isPublic,
    allowedLanguages,
    scoringSystem,
    penaltyPerWrongSubmission,
    moderators,
    isRated,
    prizes,
    tags
  } = req.body;

  // Validate problem IDs
  if (problems && problems.length > 0) {
    const problemIds = problems.map(p => p.problem);
    const existingProblems = await Problem.find({ _id: { $in: problemIds } });
    
    if (existingProblems.length !== problemIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more problems not found'
      });
    }
  }

  // Validate moderators
  if (moderators && moderators.length > 0) {
    const existingModerators = await User.find({ 
      _id: { $in: moderators },
      role: { $in: ['admin', 'moderator'] }
    });
    
    if (existingModerators.length !== moderators.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more moderators not found or not authorized'
      });
    }
  }

  const contest = await Contest.create({
    title,
    description,
    rules,
    type,
    difficulty,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    duration,
    freezeTime,
    problems: problems || [],
    maxParticipants,
    registrationStart: new Date(registrationStart),
    registrationEnd: new Date(registrationEnd),
    isPublic: isPublic !== false,
    allowedLanguages,
    scoringSystem,
    penaltyPerWrongSubmission,
    author: req.user.id,
    moderators: moderators || [],
    isRated: isRated !== false,
    prizes: prizes || [],
    tags: tags || []
  });

  // Populate the created contest
  await contest.populate('author', 'username firstName lastName');
  await contest.populate('problems.problem', 'title difficulty');
  await contest.populate('moderators', 'username firstName lastName');

  logger.info(`Contest created: ${contest.title} by ${req.user.username}`);

  res.status(201).json({
    success: true,
    data: contest
  });
});

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private (Contest moderator or admin)
const updateContest = asyncHandler(async (req, res, next) => {
  let contest = await Contest.findById(req.params.id);

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
      message: 'Not authorized to update this contest'
    });
  }

  // Don't allow updating running or ended contests (except for specific fields)
  const allowedFieldsForRunning = ['announcement', 'clarifications', 'editorials'];
  if (['running', 'ended'].includes(contest.status)) {
    const updatedFields = Object.keys(req.body);
    const hasRestrictedFields = updatedFields.some(field => !allowedFieldsForRunning.includes(field));
    
    if (hasRestrictedFields && !isAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update contest settings after it has started'
      });
    }
  }

  contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
    .populate('author', 'username firstName lastName')
    .populate('problems.problem', 'title difficulty')
    .populate('moderators', 'username firstName lastName');

  logger.info(`Contest updated: ${contest.title} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    data: contest
  });
});

// @desc    Delete contest
// @route   DELETE /api/contests/:id
// @access  Private/Admin
const deleteContest = asyncHandler(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // Only allow deletion of upcoming contests or by admin
  if (contest.status !== 'upcoming' && req.user.role !== 'admin') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete contest that has started or ended'
    });
  }

  await Contest.findByIdAndDelete(req.params.id);

  logger.info(`Contest deleted: ${contest.title} by ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'Contest deleted successfully'
  });
});

// @desc    Register for contest
// @route   POST /api/contests/:id/register
// @access  Private
const registerForContest = asyncHandler(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  try {
    await contest.registerUser(req.user.id);
    
    logger.info(`User ${req.user.username} registered for contest: ${contest.title}`);

    // Update user's contests participated count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { contestsParticipated: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully registered for contest'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Unregister from contest
// @route   POST /api/contests/:id/unregister
// @access  Private
const unregisterFromContest = asyncHandler(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // Don't allow unregistration after contest starts
  if (contest.status !== 'upcoming') {
    return res.status(400).json({
      success: false,
      message: 'Cannot unregister from contest that has started'
    });
  }

  const participantIndex = contest.participants.findIndex(
    p => p.user.toString() === req.user.id
  );

  if (participantIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'User is not registered for this contest'
    });
  }

  contest.participants.splice(participantIndex, 1);
  await contest.save();

  logger.info(`User ${req.user.username} unregistered from contest: ${contest.title}`);

  // Update user's contests participated count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { contestsParticipated: -1 }
  });

  res.status(200).json({
    success: true,
    message: 'Successfully unregistered from contest'
  });
});

// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public
const getLeaderboard = asyncHandler(async (req, res, next) => {
  const { limit = 50, showAll = false } = req.query;
  
  const leaderboardData = await Contest.getLeaderboard(req.params.id, parseInt(limit));

  if (!leaderboardData) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // If contest has freeze time and is still running, hide submissions during freeze
  const contest = await Contest.findById(req.params.id);
  const now = new Date();
  const freezeStartTime = new Date(contest.endTime.getTime() - contest.freezeTime * 60000);
  const isInFreezeTime = contest.status === 'running' && contest.freezeTime > 0 && now >= freezeStartTime;

  if (isInFreezeTime && !showAll && req.user?.role !== 'admin') {
    // Filter out submissions made during freeze time
    leaderboardData.leaderboard = leaderboardData.leaderboard.map(participant => ({
      ...participant.toObject(),
      solvedProblems: participant.solvedProblems.map(problem => ({
        ...problem.toObject(),
        submissions: problem.submissions.filter(sub => sub.submissionTime < freezeStartTime)
      }))
    }));
  }

  res.status(200).json({
    success: true,
    data: leaderboardData,
    freezeInfo: isInFreezeTime ? {
      isFrozen: true,
      freezeStartTime,
      freezeEndTime: contest.endTime
    } : { isFrozen: false }
  });
});

// @desc    Get contest problems
// @route   GET /api/contests/:id/problems
// @access  Private (Registered participants only)
const getContestProblems = asyncHandler(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id)
    .populate({
      path: 'problems.problem',
      select: 'title description inputFormat outputFormat constraints sampleTestCases difficulty tags timeLimit memoryLimit'
    });

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // Check if user is registered or is admin
  const isRegistered = contest.participants.some(p => p.user.toString() === req.user.id);
  const isAdmin = req.user.role === 'admin';
  const isModerator = contest.moderators.some(mod => mod.toString() === req.user.id);

  if (!isRegistered && !isAdmin && !isModerator) {
    return res.status(403).json({
      success: false,
      message: 'Must be registered to view contest problems'
    });
  }

  // Don't show problems before contest starts (unless admin)
  if (contest.status === 'upcoming' && !isAdmin && !isModerator) {
    return res.status(400).json({
      success: false,
      message: 'Contest problems will be available when contest starts'
    });
  }

  res.status(200).json({
    success: true,
    data: contest.problems
  });
});

// @desc    Get contest submissions
// @route   GET /api/contests/:id/submissions
// @access  Private
const getContestSubmissions = asyncHandler(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  const { limit = 50, page = 1, problemId, status, userId } = req.query;
  const skip = (page - 1) * limit;

  // Build query for submissions
  let query = { contest: req.params.id };

  if (problemId) query.problem = problemId;
  if (status) query.status = status;
  
  // Users can only see their own submissions (unless admin)
  if (req.user.role !== 'admin') {
    query.user = req.user.id;
  } else if (userId) {
    query.user = userId;
  }

  const submissions = await Submission.find(query)
    .populate('user', 'username firstName lastName')
    .populate('problem', 'title')
    .sort({ createdAt: -1 })
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

// @desc    Submit solution during contest
// @route   POST /api/contests/:contestId/problems/:problemId/submit
// @access  Private (Registered participants only)
const submitSolution = asyncHandler(async (req, res, next) => {
  const { contestId, problemId } = req.params;
  const { code, language } = req.body;

  const contest = await Contest.findById(contestId);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // Check if contest is running
  if (contest.status !== 'running') {
    return res.status(400).json({
      success: false,
      message: 'Contest is not currently running'
    });
  }

  // Check if user is registered
  const isRegistered = contest.participants.some(p => p.user.toString() === req.user.id);
  if (!isRegistered) {
    return res.status(403).json({
      success: false,
      message: 'Must be registered to submit during contest'
    });
  }

  // Check if problem is part of contest
  const contestProblem = contest.problems.find(p => p.problem.toString() === problemId);
  if (!contestProblem) {
    return res.status(400).json({
      success: false,
      message: 'Problem is not part of this contest'
    });
  }

  // Check allowed languages
  if (contest.allowedLanguages.length > 0 && !contest.allowedLanguages.includes(language)) {
    return res.status(400).json({
      success: false,
      message: `Language ${language} is not allowed in this contest`
    });
  }

  try {
    // Create submission
    const submission = await Submission.create({
      user: req.user.id,
      problem: problemId,
      contest: contestId,
      code,
      language,
      status: 'Pending'
    });

    // Update contest with submission
    await contest.submitSolution(req.user.id, problemId, submission._id);

    // Add to judge queue (implement with your existing judge system)
    // This would queue the submission for execution
    
    logger.info(`Contest submission: ${req.user.username} submitted to problem ${problemId} in contest ${contestId}`);

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    logger.error('Contest submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting solution'
    });
  }
});

// @desc    Get contest clarifications
// @route   GET /api/contests/:id/clarifications
// @access  Private (Registered participants)
const getClarifications = asyncHandler(async (req, res, next) => {
  const contest = await Contest.findById(req.params.id)
    .populate('clarifications.askedBy', 'username')
    .populate('clarifications.answeredBy', 'username');

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // Check if user is registered or is admin/moderator
  const isRegistered = contest.participants.some(p => p.user.toString() === req.user.id);
  const isAdmin = req.user.role === 'admin';
  const isModerator = contest.moderators.some(mod => mod.toString() === req.user.id);

  if (!isRegistered && !isAdmin && !isModerator) {
    return res.status(403).json({
      success: false,
      message: 'Must be registered to view clarifications'
    });
  }

  // Filter clarifications based on user role
  let clarifications = contest.clarifications;
  
  if (!isAdmin && !isModerator) {
    clarifications = clarifications.filter(c => 
      c.isPublic || c.askedBy.toString() === req.user.id
    );
  }

  res.status(200).json({
    success: true,
    data: clarifications
  });
});

// @desc    Ask clarification
// @route   POST /api/contests/:id/clarifications
// @access  Private (Registered participants)
const askClarification = asyncHandler(async (req, res, next) => {
  const { question } = req.body;

  if (!question || question.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Question is required'
    });
  }

  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: 'Contest not found'
    });
  }

  // Check if user is registered
  const isRegistered = contest.participants.some(p => p.user.toString() === req.user.id);
  if (!isRegistered) {
    return res.status(403).json({
      success: false,
      message: 'Must be registered to ask clarifications'
    });
  }

  // Don't allow clarifications after contest ends
  if (contest.status === 'ended') {
    return res.status(400).json({
      success: false,
      message: 'Cannot ask clarifications after contest has ended'
    });
  }

  await contest.addClarification(question, req.user.id);

  logger.info(`Clarification asked by ${req.user.username} in contest: ${contest.title}`);

  // Emit real-time notification to moderators
  if (global.io) {
    global.io.to(`contest-${contest._id}-mods`).emit('new-clarification', {
      contestId: contest._id,
      question,
      askedBy: req.user.username
    });
  }

  res.status(201).json({
    success: true,
    message: 'Clarification submitted successfully'
  });
});

module.exports = {
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
};
