const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  explanation: {
    type: String,
    default: ''
  }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a problem title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a problem description']
  },
  inputFormat: {
    type: String,
    required: [true, 'Please provide input format specification']
  },
  outputFormat: {
    type: String,
    required: [true, 'Please provide output format specification']
  },
  constraints: {
    type: String,
    required: [true, 'Please provide problem constraints']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: [true, 'Please specify difficulty level']
  },
  difficultyRating: {
    type: Number,
    min: 800,
    max: 3500,
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    required: true,
    enum: [
      'Array',
      'String',
      'Linked List',
      'Binary Tree',
      'Dynamic Programming',
      'Greedy',
      'Graph',
      'Sorting',
      'Math',
      'Other'
    ]
  },
  testCases: {
    type: [testCaseSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Problem must have at least one test case'
    }
  },
  sampleTestCases: [{
    input: String,
    output: String,
    explanation: String
  }],
  timeLimit: {
    type: Number,
    default: 2000, // in milliseconds
    min: 1000,
    max: 10000
  },
  memoryLimit: {
    type: Number,
    default: 256, // in MB
    min: 64,
    max: 512
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  editorialContent: {
    type: String,
    default: ''
  },
  hints: [{
    type: String,
    maxlength: [500, 'Hint cannot exceed 500 characters']
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  acceptedSubmissions: {
    type: Number,
    default: 0
  },
  acceptance: {
    type: Number,
    default: 0,
    max: 100
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  solvedBy: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    solvedAt: {
      type: Date,
      default: Date.now
    },
    language: String,
    runtime: Number,
    memory: Number
  }],
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
problemSchema.index({ title: 'text', description: 'text' });
problemSchema.index({ difficulty: 1 });
problemSchema.index({ difficultyRating: 1 });
problemSchema.index({ category: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ status: 1 });
problemSchema.index({ slug: 1 });

// Virtual for acceptance rate
problemSchema.virtual('acceptanceRate').get(function() {
  if (this.totalSubmissions === 0) return 0;
  return Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
});

// Pre-save middleware to generate slug
problemSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }
  
  if (this.isModified('totalSubmissions') || this.isModified('acceptedSubmissions')) {
    if (this.totalSubmissions > 0) {
      this.acceptance = Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
    }
  }
  
  next();
});

// Instance method to add submission
problemSchema.methods.addSubmission = function(isAccepted = false) {
  this.totalSubmissions += 1;
  if (isAccepted) {
    this.acceptedSubmissions += 1;
  }
  this.acceptance = Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
  return this.save();
};

module.exports = mongoose.model('Problem', problemSchema);
