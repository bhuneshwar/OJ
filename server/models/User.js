const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'Please provide your first name'],
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name'],
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  country: {
    type: String,
    maxlength: [100, 'Country name cannot exceed 100 characters']
  },
  institution: {
    type: String,
    maxlength: [200, 'Institution name cannot exceed 200 characters']
  },
  rating: {
    type: Number,
    default: 1200,
    min: 0,
    max: 5000
  },
  rank: {
    type: String,
    enum: ['Newbie', 'Pupil', 'Specialist', 'Expert', 'Candidate Master', 'Master', 'International Master', 'Grandmaster', 'International Grandmaster', 'Legendary Grandmaster'],
    default: 'Newbie'
  },
  problemsSolved: {
    type: Number,
    default: 0
  },
  contestsParticipated: {
    type: Number,
    default: 0
  },
  submissions: {
    type: Number,
    default: 0
  },
  acceptedSubmissions: {
    type: Number,
    default: 0
  },
  solvedProblems: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Problem'
  }],
  favoriteProblems: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Problem'
  }],
  following: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ru'],
      default: 'en'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    contestReminders: {
      type: Boolean,
      default: true
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ rating: -1 });
userSchema.index({ problemsSolved: -1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to generate JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      username: this.username,
      role: this.role 
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        lockUntil: 1
      },
      $set: {
        loginAttempts: 1
      }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockUntil: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Instance method to update rating
userSchema.methods.updateRating = function(newRating) {
  this.rating = newRating;
  
  // Update rank based on rating
  if (newRating >= 3000) this.rank = 'Legendary Grandmaster';
  else if (newRating >= 2600) this.rank = 'International Grandmaster';
  else if (newRating >= 2400) this.rank = 'Grandmaster';
  else if (newRating >= 2300) this.rank = 'International Master';
  else if (newRating >= 2100) this.rank = 'Master';
  else if (newRating >= 1900) this.rank = 'Candidate Master';
  else if (newRating >= 1600) this.rank = 'Expert';
  else if (newRating >= 1400) this.rank = 'Specialist';
  else if (newRating >= 1200) this.rank = 'Pupil';
  else this.rank = 'Newbie';
  
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
