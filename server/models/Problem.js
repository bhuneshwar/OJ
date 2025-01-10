const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: String,
    output: String,
    operations: [String],
    size: Number,
});

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium'
    },
    acceptanceRate: {
        type: Number,
        default: 0
    },
    submissions: {
        type: Number,
        default: 0
    },
    example: {
        type: String,
        required: true
    },
    input: String,
    output: String,
    testCases: [testCaseSchema],
}, {
    timestamps: true
});

module.exports = mongoose.model('Problem', problemSchema);