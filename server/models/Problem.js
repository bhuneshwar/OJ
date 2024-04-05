const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: String,
    output: String,
    operations: [String],
    size: Number,
});

const problemSchema = new mongoose.Schema({
    title: String,
    description: String,
    input: String,
    output: String,
    testCases: [testCaseSchema],
});

module.exports = mongoose.model('Problem', problemSchema);