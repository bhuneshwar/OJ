const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const logger = require('../utils/logger');

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          rating: user.rating,
          rank: user.rank,
          problemsSolved: user.problemsSolved,
          contestsParticipated: user.contestsParticipated,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          preferences: user.preferences,
          createdAt: user.createdAt
        }
      }
    });
};

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
const register = asyncHandler(async (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;

  // Validate input
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      error: 'Please provide all required fields'
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User with this email or username already exists'
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName
  });

  logger.info(`New user registered: ${username} (${email})`);

  sendTokenResponse(user, 201, res);
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
const login = asyncHandler(async (req, res, next) => {
  const { login, password } = req.body; // login can be email or username

  // Validate email & password
  if (!login || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email/username and password'
    });
  }

  // Check for user (include password since it's set to select: false)
  const user = await User.findOne({
    $or: [
      { email: login.toLowerCase() },
      { username: login }
    ]
  }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Check if account is locked
  if (user.isLocked) {
    return res.status(423).json({
      success: false,
      error: 'Account is temporarily locked due to too many failed login attempts'
    });
  }

  // Check if password matches
  const isMatch = await user.correctPassword(password, user.password);

  if (!isMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last active
  user.lastActive = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${user.username}`);

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/auth/logout
// @access    Private
const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  logger.info(`User logged out: ${req.user.username}`);

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
});

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
const getMe = asyncHandler(async (req, res, next) => {
  // Update last active
  req.user.lastActive = new Date();
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        fullName: req.user.fullName,
        role: req.user.role,
        avatar: req.user.avatar,
        bio: req.user.bio,
        country: req.user.country,
        institution: req.user.institution,
        rating: req.user.rating,
        rank: req.user.rank,
        problemsSolved: req.user.problemsSolved,
        contestsParticipated: req.user.contestsParticipated,
        submissions: req.user.submissions,
        acceptedSubmissions: req.user.acceptedSubmissions,
        solvedProblems: req.user.solvedProblems,
        favoriteProblems: req.user.favoriteProblems,
        following: req.user.following,
        followers: req.user.followers,
        preferences: req.user.preferences,
        emailVerified: req.user.emailVerified,
        lastActive: req.user.lastActive,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe
};
