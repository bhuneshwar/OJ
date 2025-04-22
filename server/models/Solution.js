const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true,
        enum: ['python', 'javascript', 'cpp', 'java']
    },
    status: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error'],
        required: true
    },
    executionTime: {
        type: Number,
        required: true
    },
    memoryUsage: {
        type: Number,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create a compound index for user and problem
solutionSchema.index({ user: 1, problem: 1 });

module.exports = mongoose.model('Solution', solutionSchema);
