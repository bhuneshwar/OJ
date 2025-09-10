const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  registrationTime: {
    type: Date,
    default: Date.now
  },
  rank: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  penalty: {
    type: Number,
    default: 0
  },
  solvedProblems: [{
    problem: {
      type: mongoose.Schema.ObjectId,
      ref: 'Problem'
    },
    submissions: [{
      submission: {
        type: mongoose.Schema.ObjectId,
        ref: 'Submission'
      },
      submissionTime: Date,
      verdict: String,
      penalty: {
        type: Number,
        default: 0
      }
    }],
    firstAcceptedSubmission: {
      type: mongoose.Schema.ObjectId,
      ref: 'Submission'
    },
    acceptedTime: Date,
    attempts: {
      type: Number,
      default: 0
    },
    isSolved: {
      type: Boolean,
      default: false
    }
  }],
  lastSubmissionTime: {
    type: Date
  }
});

const contestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Contest title is required'],
    trim: true,
    maxlength: [200, 'Contest title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Contest description is required']
  },
  rules: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['ICPC', 'IOI', 'AtCoder', 'Educational', 'Unrated', 'Div1', 'Div2', 'Div3', 'Div4'],
    required: [true, 'Contest type is required']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    required: true
  },
  startTime: {
    type: Date,
    required: [true, 'Contest start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'Contest end time is required']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Contest duration is required'],
    min: 30,
    max: 10080 // 7 days
  },
  freezeTime: {
    type: Number, // minutes before end when scoreboard freezes
    default: 0
  },
  problems: [{
    problem: {
      type: mongoose.Schema.ObjectId,
      ref: 'Problem',
      required: true
    },
    label: {
      type: String,
      required: true // A, B, C, etc.
    },
    points: {
      type: Number,
      default: 100
    },
    firstBlood: {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      },
      submission: {
        type: mongoose.Schema.ObjectId,
        ref: 'Submission'
      },
      time: Date
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    acceptedSubmissions: {
      type: Number,
      default: 0
    },
    solvers: [{
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }]
  }],
  participants: [participantSchema],
  maxParticipants: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  registrationStart: {
    type: Date,
    required: true
  },
  registrationEnd: {
    type: Date,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  allowedLanguages: [{
    type: String,
    enum: [
      'javascript',
      'python',
      'java',
      'cpp',
      'c',
      'csharp',
      'go',
      'rust',
      'php',
      'ruby',
      'swift',
      'kotlin',
      'typescript',
      'scala'
    ]
  }],
  scoringSystem: {
    type: String,
    enum: ['ICPC', 'IOI', 'CF'], // ICPC, IOI (subtask), Codeforces
    default: 'ICPC'
  },
  penaltyPerWrongSubmission: {
    type: Number,
    default: 20 // minutes
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'running', 'ended', 'cancelled'],
    default: 'upcoming'
  },
  isRated: {
    type: Boolean,
    default: true
  },
  ratingChanges: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    oldRating: Number,
    newRating: Number,
    change: Number
  }],
  prizes: [{
    rank: Number,
    prize: String,
    description: String
  }],
  announcement: {
    type: String,
    default: ''
  },
  clarifications: [{
    question: String,
    answer: String,
    askedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    answeredBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  editorials: [{
    problem: {
      type: mongoose.Schema.ObjectId,
      ref: 'Problem'
    },
    content: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    publishTime: {
      type: Date
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  metadata: {
    totalRegistrations: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    uniqueParticipants: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
contestSchema.index({ startTime: 1, endTime: 1 });
contestSchema.index({ status: 1 });
contestSchema.index({ type: 1 });
contestSchema.index({ difficulty: 1 });
contestSchema.index({ slug: 1 });
contestSchema.index({ author: 1 });
contestSchema.index({ 'participants.user': 1 });
contestSchema.index({ tags: 1 });
contestSchema.index({ isPublic: 1, isVisible: 1 });

// Virtual for contest duration in human readable format
contestSchema.virtual('durationFormatted').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  if (hours === 0) {
    return `${minutes} minutes`;
  }
  return minutes === 0 ? `${hours} hours` : `${hours}h ${minutes}m`;
});

// Virtual for time remaining (if contest is running)
contestSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'running') return 0;
  return Math.max(0, this.endTime.getTime() - Date.now());
});

// Virtual for registration status
contestSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (now < this.registrationStart) return 'not-started';
  if (now > this.registrationEnd) return 'ended';
  return 'open';
});

// Virtual for participants count
contestSchema.virtual('participantsCount').get(function() {
  return this.participants.length;
});

// Pre-save middleware to generate slug and update status
contestSchema.pre('save', function(next) {
  // Generate slug from title
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  
  // Update status based on current time
  const now = new Date();
  if (now < this.startTime) {
    this.status = 'upcoming';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'running';
  } else if (now > this.endTime) {
    this.status = 'ended';
  }
  
  // Calculate metadata
  this.metadata.totalRegistrations = this.participants.length;
  this.metadata.uniqueParticipants = this.participants.filter(p => p.solvedProblems.length > 0).length;
  
  if (this.participants.length > 0) {
    const totalScore = this.participants.reduce((sum, p) => sum + p.score, 0);
    this.metadata.averageScore = totalScore / this.participants.length;
  }
  
  next();
});

// Instance method to register user
contestSchema.methods.registerUser = function(userId) {
  const now = new Date();
  
  // Check registration window
  if (now < this.registrationStart || now > this.registrationEnd) {
    throw new Error('Registration is not open');
  }
  
  // Check if user is already registered
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (existingParticipant) {
    throw new Error('User is already registered');
  }
  
  // Check max participants
  if (this.maxParticipants > 0 && this.participants.length >= this.maxParticipants) {
    throw new Error('Contest is full');
  }
  
  this.participants.push({
    user: userId,
    solvedProblems: this.problems.map(p => ({
      problem: p.problem,
      submissions: [],
      attempts: 0,
      isSolved: false
    }))
  });
  
  return this.save();
};

// Instance method to submit solution
contestSchema.methods.submitSolution = function(userId, problemId, submissionId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not registered for this contest');
  }
  
  const problemEntry = participant.solvedProblems.find(p => p.problem.toString() === problemId.toString());
  if (!problemEntry) {
    throw new Error('Problem is not part of this contest');
  }
  
  const submissionTime = new Date();
  
  problemEntry.submissions.push({
    submission: submissionId,
    submissionTime,
    penalty: 0
  });
  
  problemEntry.attempts += 1;
  participant.lastSubmissionTime = submissionTime;
  
  return this.save();
};

// Instance method to update submission result
contestSchema.methods.updateSubmissionResult = function(userId, problemId, submissionId, verdict, executionTime) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) return this;
  
  const problemEntry = participant.solvedProblems.find(p => p.problem.toString() === problemId.toString());
  if (!problemEntry) return this;
  
  const submissionEntry = problemEntry.submissions.find(s => s.submission.toString() === submissionId.toString());
  if (!submissionEntry) return this;
  
  submissionEntry.verdict = verdict;
  
  // If accepted and not already solved
  if (verdict === 'Accepted' && !problemEntry.isSolved) {
    problemEntry.isSolved = true;
    problemEntry.firstAcceptedSubmission = submissionId;
    problemEntry.acceptedTime = submissionEntry.submissionTime;
    
    // Calculate penalty (time from start + wrong submission penalties)
    const timeFromStart = Math.floor((submissionEntry.submissionTime - this.startTime) / 60000); // minutes
    const wrongSubmissions = problemEntry.attempts - 1; // excluding the accepted one
    const penalty = timeFromStart + (wrongSubmissions * this.penaltyPerWrongSubmission);
    
    submissionEntry.penalty = penalty;
    participant.penalty += penalty;
    participant.score += this.problems.find(p => p.problem.toString() === problemId.toString()).points;
    
    // Check for first blood
    const contestProblem = this.problems.find(p => p.problem.toString() === problemId.toString());
    if (contestProblem && !contestProblem.firstBlood.user) {
      contestProblem.firstBlood = {
        user: userId,
        submission: submissionId,
        time: submissionEntry.submissionTime
      };
    }
  }
  
  return this.save();
};

// Instance method to calculate rankings
contestSchema.methods.calculateRankings = function() {
  // Sort participants by score (desc), then by penalty (asc), then by last submission time (asc)
  this.participants.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score; // Higher score is better
    }
    if (a.penalty !== b.penalty) {
      return a.penalty - b.penalty; // Lower penalty is better
    }
    return (a.lastSubmissionTime || new Date(0)) - (b.lastSubmissionTime || new Date(0)); // Earlier submission is better
  });
  
  // Assign ranks
  let currentRank = 1;
  this.participants.forEach((participant, index) => {
    if (index > 0) {
      const previous = this.participants[index - 1];
      if (participant.score !== previous.score || participant.penalty !== previous.penalty) {
        currentRank = index + 1;
      }
    }
    participant.rank = currentRank;
  });
  
  return this.save();
};

// Instance method to add clarification
contestSchema.methods.addClarification = function(question, askedBy, answer = '', answeredBy = null, isPublic = false) {
  this.clarifications.push({
    question,
    answer,
    askedBy,
    answeredBy,
    isPublic
  });
  
  return this.save();
};

// Static method to get upcoming contests
contestSchema.statics.getUpcomingContests = function(limit = 10) {
  return this.find({ 
    status: 'upcoming', 
    isVisible: true,
    isPublic: true
  })
  .populate('author', 'username firstName lastName')
  .populate('problems.problem', 'title difficulty')
  .sort({ startTime: 1 })
  .limit(limit);
};

// Static method to get running contests
contestSchema.statics.getRunningContests = function() {
  return this.find({ 
    status: 'running',
    isVisible: true,
    isPublic: true
  })
  .populate('author', 'username firstName lastName')
  .populate('problems.problem', 'title difficulty')
  .sort({ endTime: 1 });
};

// Static method to get contest leaderboard
contestSchema.statics.getLeaderboard = function(contestId, limit = 50) {
  return this.findById(contestId)
    .populate('participants.user', 'username firstName lastName rating rank')
    .populate('problems.problem', 'title')
    .select('participants problems title type scoringSystem')
    .then(contest => {
      if (!contest) return null;
      
      // Sort participants by rank
      contest.participants.sort((a, b) => a.rank - b.rank);
      
      return {
        contest: {
          title: contest.title,
          type: contest.type,
          scoringSystem: contest.scoringSystem,
          problems: contest.problems
        },
        leaderboard: contest.participants.slice(0, limit)
      };
    });
};

module.exports = mongoose.model('Contest', contestSchema);
