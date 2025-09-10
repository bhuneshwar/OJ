const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  testCaseId: {
    type: mongoose.Schema.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Compilation Error'],
    required: true
  },
  executionTime: {
    type: Number, // in milliseconds
    min: 0
  },
  memoryUsed: {
    type: Number, // in KB
    min: 0
  },
  input: String,
  expectedOutput: String,
  actualOutput: String,
  errorMessage: String
});

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Submission must belong to a user']
  },
  problem: {
    type: mongoose.Schema.ObjectId,
    ref: 'Problem',
    required: [true, 'Submission must be for a problem']
  },
  contest: {
    type: mongoose.Schema.ObjectId,
    ref: 'Contest',
    default: null
  },
  code: {
    type: String,
    required: [true, 'Code is required for submission']
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
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
      'scala',
      'perl',
      'haskell',
      'lua',
      'r',
      'matlab',
      'sql'
    ]
  },
  status: {
    type: String,
    enum: [
      'Pending',
      'Running',
      'Accepted',
      'Wrong Answer',
      'Time Limit Exceeded',
      'Memory Limit Exceeded',
      'Runtime Error',
      'Compilation Error',
      'Presentation Error',
      'System Error',
      'Judging',
      'Partial'
    ],
    default: 'Pending'
  },
  verdict: {
    type: String,
    default: 'Pending'
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  passedTestCases: {
    type: Number,
    default: 0
  },
  failedTestCases: {
    type: Number,
    default: 0
  },
  testCaseResults: [testCaseResultSchema],
  executionTime: {
    type: Number, // in milliseconds
    min: 0,
    default: 0
  },
  memoryUsed: {
    type: Number, // in KB
    min: 0,
    default: 0
  },
  compilationOutput: {
    type: String,
    default: ''
  },
  runtimeOutput: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  judgeOutput: {
    type: String,
    default: ''
  },
  codeLength: {
    type: Number,
    min: 0
  },
  submissionId: {
    type: String,
    unique: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isContestSubmission: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  judgedAt: {
    type: Date
  },
  judgeVersion: {
    type: String,
    default: '1.0'
  },
  environment: {
    type: String,
    default: 'sandbox'
  },
  metadata: {
    submissionSource: {
      type: String,
      enum: ['web', 'api', 'cli', 'ide'],
      default: 'web'
    },
    editorTheme: String,
    fontSize: Number,
    tabSize: Number,
    additionalFlags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ problem: 1, createdAt: -1 });
submissionSchema.index({ contest: 1, createdAt: -1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ language: 1 });
submissionSchema.index({ submissionId: 1 });
submissionSchema.index({ submittedAt: -1 });
submissionSchema.index({ user: 1, problem: 1, status: 1 });

// Compound index for contest leaderboards
submissionSchema.index({ contest: 1, user: 1, status: 1, submittedAt: 1 });

// Virtual for submission URL
submissionSchema.virtual('submissionUrl').get(function() {
  return `/submissions/${this.submissionId}`;
});

// Virtual for success rate
submissionSchema.virtual('successRate').get(function() {
  if (this.totalTestCases === 0) return 0;
  return Math.round((this.passedTestCases / this.totalTestCases) * 100);
});

// Virtual for time taken (human readable)
submissionSchema.virtual('timeTaken').get(function() {
  if (this.executionTime < 1000) {
    return `${this.executionTime}ms`;
  }
  return `${(this.executionTime / 1000).toFixed(2)}s`;
});

// Virtual for memory used (human readable)
submissionSchema.virtual('memoryUsedFormatted').get(function() {
  if (this.memoryUsed < 1024) {
    return `${this.memoryUsed}KB`;
  }
  return `${(this.memoryUsed / 1024).toFixed(2)}MB`;
});

// Pre-save middleware
submissionSchema.pre('save', function(next) {
  // Generate submission ID if not exists
  if (!this.submissionId) {
    this.submissionId = `SUB${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  // Calculate code length
  if (this.code) {
    this.codeLength = this.code.length;
  }
  
  // Set judged time when status changes from pending/running
  if (this.isModified('status') && ['Pending', 'Running', 'Judging'].indexOf(this.status) === -1) {
    this.judgedAt = new Date();
  }
  
  // Calculate pass/fail counts from test case results
  if (this.testCaseResults && this.testCaseResults.length > 0) {
    this.totalTestCases = this.testCaseResults.length;
    this.passedTestCases = this.testCaseResults.filter(tc => tc.status === 'Accepted').length;
    this.failedTestCases = this.totalTestCases - this.passedTestCases;
    
    // Calculate score based on passed test cases
    this.score = Math.round((this.passedTestCases / this.totalTestCases) * 100);
    
    // Determine overall status
    if (this.passedTestCases === this.totalTestCases) {
      this.status = 'Accepted';
      this.verdict = 'Accepted';
    } else if (this.passedTestCases === 0) {
      // Use the status from the first failed test case
      const firstFailed = this.testCaseResults.find(tc => tc.status !== 'Accepted');
      if (firstFailed) {
        this.status = firstFailed.status;
        this.verdict = firstFailed.status;
      }
    } else {
      this.status = 'Partial';
      this.verdict = `Partial (${this.passedTestCases}/${this.totalTestCases})`;
    }
  }
  
  next();
});

// Instance method to add test case result
submissionSchema.methods.addTestCaseResult = function(testCaseId, status, executionTime, memoryUsed, input, expectedOutput, actualOutput, errorMessage) {
  this.testCaseResults.push({
    testCaseId,
    status,
    executionTime,
    memoryUsed,
    input,
    expectedOutput,
    actualOutput,
    errorMessage
  });
  
  return this.save();
};

// Instance method to update execution statistics
submissionSchema.methods.updateExecutionStats = function(totalTime, totalMemory) {
  this.executionTime = totalTime;
  this.memoryUsed = totalMemory;
  return this.save();
};

// Instance method to mark as judged
submissionSchema.methods.markAsJudged = function(finalStatus, verdict) {
  this.status = finalStatus;
  this.verdict = verdict;
  this.judgedAt = new Date();
  return this.save();
};

// Static method to get user's submissions for a problem
submissionSchema.statics.getUserProblemSubmissions = function(userId, problemId, limit = 10) {
  return this.find({ user: userId, problem: problemId })
    .populate('problem', 'title difficulty')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-code'); // Exclude code for performance
};

// Static method to get recent submissions
submissionSchema.statics.getRecentSubmissions = function(limit = 20) {
  return this.find({ isPublic: true })
    .populate('user', 'username firstName lastName')
    .populate('problem', 'title difficulty')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-code -testCaseResults');
};

// Static method to get submission statistics
submissionSchema.statics.getSubmissionStats = function(filters = {}) {
  return this.aggregate([
    { $match: filters },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgExecutionTime: { $avg: '$executionTime' },
        avgMemoryUsed: { $avg: '$memoryUsed' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get language statistics
submissionSchema.statics.getLanguageStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 },
        acceptedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        successRate: {
          $round: [{ $multiply: [{ $divide: ['$acceptedCount', '$count'] }, 100] }, 2]
        }
      }
    },
    { $sort: { count: -1 } }
  ]);
};
