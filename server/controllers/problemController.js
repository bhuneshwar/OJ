// controllers/problemController.js

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
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
        const { code, language, input } = req.body;

        // Create a unique directory for each request to avoid conflicts
        const directory = path.join(__dirname, 'code', Date.now().toString());
        fs.mkdirSync(directory, { recursive: true });

        // Save the code to a file based on the language
        const fileName = `code.${getExtension(language)}`;
        const filePath = path.join(directory, fileName);
        fs.writeFileSync(filePath, code);

        // Save the input to a file
        const inputPath = path.join(directory, 'input.txt');
        fs.writeFileSync(inputPath, input);

        // Spawn a child process to execute the code
        const childProcess = spawn(getExecutionCommand(language), getExecutionArguments(language, filePath, inputPath));

        let output = '';
        let error = '';

        childProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        childProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        childProcess.on('close', (code) => {
            // Delete the temporary directory and files
            fs.rmdirSync(directory, { recursive: true });

            if (code === 0) {
                res.json({ output });
            } else {
                res.status(400).json({ error });
            }
        });
    

    // Helper function to get the file extension based on the language
    function getExtension(language) {
        switch (language) {
            case 'cpp':
                return 'cpp';
            case 'py':
                return 'py';
            case 'java':
                return 'java';
            // Add more cases for other supported languages
            default:
                return '';
        }
    }

    // Helper function to get the execution command based on the language
    function getExecutionCommand(language) {
        switch (language) {
            case 'cpp':
                return 'g++';
            case 'py':
                return 'python';
            case 'java':
                return 'java';
            // Add more cases for other supported languages
            default:
                return '';
        }
    }

    // Helper function to get the execution arguments based on the language
    function getExecutionArguments(language, filePath, inputPath) {
        switch (language) {
            case 'cpp':
                return [filePath, '-o', 'output', '&&', './output', '<', inputPath];
            case 'py':
                return [filePath, '<', inputPath];
            case 'java':
                return [filePath, '<', inputPath];
            // Add more cases for other supported languages
            default:
                return [];
        }
    }

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




