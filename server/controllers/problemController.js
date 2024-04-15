// controllers/problemController.js

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const Problem = require('../models/Problem');

exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find();
        if (!problems || problems.length === 0) {
            return res.status(404).json({ message: 'No problems found' });
        }
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
        const { code, language, input } = req.body;
        const problemId = req.params.id;

        const sanitizedProblemId = path.normalize(problemId).replace(/[^a-zA-Z0-9]/g, '');
        const directory = path.join(__dirname, 'code', sanitizedProblemId);
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        }

        const timestamp = Date.now();
        const fileName = `code_${timestamp}.${getExtension(language)}`;
        const filePath = path.join(directory, fileName);

        try {
            fs.writeFileSync(filePath, code);
            console.log("Code file written successfully");
        } catch (error) {
            console.error("Error writing code file:", error);
            return res.status(500).json({ error: 'Server error' });
        }

        const command = getExecutionCommand(language);
        const args = getExecutionArguments(language, filePath);

        const childProcess = spawn(command, args);

        if (input) {
            childProcess.stdin.write(input);
            childProcess.stdin.end();
        }

        let output = '';
        let error = '';

        childProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        childProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        childProcess.on('close', (code) => {
            if (code === 0) {
                res.json({ output: output.trim() });
            } else {
                res.status(400).json({ error });
            }
        });
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

function getExtension(language) {
    switch (language) {
        case 'cpp':
            return 'cpp';
        case 'py':
            return 'py';
        case 'java':
            return 'java';
        default:
            return '';
    }
}

function getExecutionCommand(language) {
    switch (language) {
        case 'cpp':
            return 'g++';
        case 'py':
            return 'python';
        case 'java':
            return 'java';
        default:
            return '';
    }
}

function getExecutionArguments(language, filePath) {
    switch (language) {
        case 'cpp':
            return [filePath, '-o', 'output', '&&', './output'];
        case 'py':
            return [filePath];
        case 'java':
            return [filePath];
        default:
            return [];
    }
}

// Schedule the cleanup task to run daily at midnight
cron.schedule('0 0 * * *', () => {
    const problemsDir = path.join(__dirname, 'code');

    fs.readdir(problemsDir, (err, problemDirs) => {
        if (err) {
            console.error('Error reading problems directory:', err);
            return;
        }

        problemDirs.forEach((problemId) => {
            const problemDir = path.join(problemsDir, problemId);

            fs.readdir(problemDir, (err, files) => {
                if (err) {
                    console.error('Error reading problem directory:', err);
                    return;
                }

                files.forEach((file) => {
                    const filePath = path.join(problemDir, file);
                    const fileStats = fs.statSync(filePath);
                    const fileAge = Date.now() - fileStats.mtimeMs;

                    if (fileAge > 7 * 24 * 60 * 60 * 1000) {
                        fs.unlinkSync(filePath);
                    }
                });
            });
        });
    });
});
