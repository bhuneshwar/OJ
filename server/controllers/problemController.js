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
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: 'Problem not found' });
        }
        res.json(problem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.runProblemById = async (req, res) => {
    try {
        // logic for compiling and running code with chosen particular language
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.submitProblemById = async (req, res) => {
    try {
        // logic for running testcases and if all passed then save it to database
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};