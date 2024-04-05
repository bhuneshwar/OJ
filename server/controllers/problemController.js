// controllers/problemController.js
const Problem = require('../models/Problem');

exports.getAllProblems = async (req, res) => {
    try {
        // Fetch all problems from the database
        const problems = await Problem.find();
        // Check if problems exist
        if (!problems || problems.length === 0) {
            return res.status(404).json({ message: 'No problems found' });
        }

        // Return the fetched problems
        res.status(200).json(problems);
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
