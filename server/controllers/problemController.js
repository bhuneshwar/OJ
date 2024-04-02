// controllers/problemController.js
const Problem = require('../models/Problem');

exports.getAllProblems = async (req, res) => {
    try {
        // Your logic to fetch all problems from the database
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        // Your logic to fetch a problem by ID from the database
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
