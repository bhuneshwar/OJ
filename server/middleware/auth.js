const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');

// Protect routes - authentication required
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user account is active
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account has been deactivated'
      });
    }

    // Check if account is locked
    if (req.user.isLocked) {
      return res.status(401).json({
        success: false,
        error: 'Account is temporarily locked'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional authentication - user info if token is provided
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Get token from cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Invalid token, but continue without user
      req.user = null;
    }
  }

  next();
});

// Check if user owns the resource or is admin
const ownerOrAdmin = asyncHandler(async (req, res, next) => {
  const resourceUserId = req.params.userId || req.body.userId || req.params.id;
  
  if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this resource'
    });
  }
});

// Check if user is contest moderator or admin
const contestModerator = asyncHandler(async (req, res, next) => {
  const Contest = require('../models/Contest');
  const contestId = req.params.contestId || req.params.id;
  
  if (req.user.role === 'admin') {
    return next();
  }
  
  const contest = await Contest.findById(contestId);
  
  if (!contest) {
    return res.status(404).json({
      success: false,
      error: 'Contest not found'
    });
  }
  
  const isAuthor = contest.author.toString() === req.user._id.toString();
  const isModerator = contest.moderators.includes(req.user._id);
  
  if (isAuthor || isModerator) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to moderate this contest'
    });
  }
});

// Rate limiting for authenticated users (higher limits)
const authenticatedRateLimit = (req, res, next) => {
  if (req.user) {
    // Higher rate limits for authenticated users
    req.rateLimit = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: req.user.role === 'admin' ? 1000 : 200 // Admin gets higher limits
    };
  }
  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
  ownerOrAdmin,
  contestModerator,
  authenticatedRateLimit
};
