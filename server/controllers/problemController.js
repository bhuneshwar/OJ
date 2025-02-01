// controllers/problemController.js

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const Problem = require('../models/Problem');
const Solution = require('../models/Solution');

exports.getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find();
        if (!problems || problems.length === 0) {
            return res.status(404).json({ message: 'No problems found' });
        }

        // Get user's solved problems
        const userSolutions = await Solution.find({ 
            user: req.user._id,
            status: 'Accepted'
        }).distinct('problem');

        // Add solved status to each problem
        const problemsWithStatus = problems.map(problem => ({
            ...problem._doc,
            solved: userSolutions.includes(problem._id)
        }));

        res.status(200).json(problemsWithStatus);
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

        console.log("User ID from authMiddleware:", req.user?._id); // Debugging

        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userSolution = await Solution.findOne({
            user: req.user._id, 
            problem: req.params.id,
        }).sort({ createdAt: -1 });

        res.json({ problem, userSolution });
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.runProblemById = async (req, res) => {
    try {
        const { code, language, input } = req.body;
        const problemId = req.params.id;

        // Input validation
        if (!code || !language) {
            return res.status(400).json({ error: 'Code and language are required' });
        }

        // Create a temporary directory for the code
        const timestamp = Date.now();
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Create the code file
        const fileName = `code_${timestamp}.${getExtension(language)}`;
        const filePath = path.join(tempDir, fileName);
        fs.writeFileSync(filePath, code);

        let executionOutput = {
            status: 'success',
            stdout: '',
            stderr: '',
            executionTime: 0
        };

        const startTime = process.hrtime();

        try {
            if (language === 'python') {
                const pythonProcess = spawn('python', [filePath]);
                
                if (input) {
                    pythonProcess.stdin.write(input);
                    pythonProcess.stdin.end();
                }

                const outputPromise = new Promise((resolve, reject) => {
                    let stdout = '';
                    let stderr = '';
                    
                    pythonProcess.stdout.on('data', (data) => {
                        stdout += data.toString();
                    });

                    pythonProcess.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });

                    pythonProcess.on('close', (code) => {
                        const endTime = process.hrtime(startTime);
                        const executionTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds

                        resolve({
                            status: code === 0 ? 'success' : 'error',
                            stdout: stdout.trim(),
                            stderr: stderr.trim(),
                            executionTime: executionTime.toFixed(2)
                        });
                    });

                    pythonProcess.on('error', (error) => {
                        reject(error);
                    });

                    // Set timeout for execution (5 seconds)
                    setTimeout(() => {
                        pythonProcess.kill();
                        reject(new Error('Execution timed out'));
                    }, 5000);
                });

                executionOutput = await outputPromise;
            } else {
                throw new Error('Unsupported language');
            }

            // Clean up the temporary file
            fs.unlinkSync(filePath);

            res.json(executionOutput);
        } catch (error) {
            // Clean up the temporary file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            res.status(400).json({
                status: 'error',
                error: error.message,
                stderr: executionOutput.stderr
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            status: 'error',
            error: 'Server error occurred while executing the code'
        });
    }
};

exports.submitProblemById = async (req, res) => {
    try {
        const { code, language } = req.body;
        const problemId = req.params.id;

        // First run the code
        const executionResult = await runCode(code, language, problemId);
        
        // Save the solution
        const solution = new Solution({
            user: req.user._id,
            problem: problemId,
            code,
            language,
            status: executionResult.status === 'success' ? 'Accepted' : 'Runtime Error',
            executionTime: executionResult.executionTime
        });

        await solution.save();

        res.json({
            ...executionResult,
            solutionId: solution._id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getSolutionsByProblemId = async (req, res) => {
    try {
        const solutions = await Solution.find({ 
            problem: req.params.id,
            status: 'Accepted'
        })
        .populate('user', 'username')
        .sort({ executionTime: 1 })
        .limit(10);

        res.json(solutions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getUserSolutions = async (req, res) => {
    try {
        const solutions = await Solution.find({ 
            user: req.user._id 
        })
        .populate('problem', 'title difficulty')
        .sort({ submittedAt: -1 });

        res.json(solutions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getUserSolutionForProblem = async (req, res) => {
    try {
        const solution = await Solution.findOne({
            user: req.user._id,
            problem: req.params.id,
            status: 'Accepted'
        }).sort({ submittedAt: -1 });

        if (!solution) {
            return res.status(404).json({ message: 'No solution found' });
        }

        res.json(solution);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Helper function to run code
async function runCode(code, language, problemId) {
    // Your existing code execution logic here
    // Return format should be:
    // {
    //     status: 'success' | 'error',
    //     stdout: string,
    //     stderr: string,
    //     executionTime: number
    // }
    const timestamp = Date.now();
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `code_${timestamp}.${getExtension(language)}`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, code);

    let executionOutput = {
        status: 'success',
        stdout: '',
        stderr: '',
        executionTime: 0
    };

    const startTime = process.hrtime();

    try {
        if (language === 'python') {
            const pythonProcess = spawn('python', [filePath]);
            
            const outputPromise = new Promise((resolve, reject) => {
                let stdout = '';
                let stderr = '';
                
                pythonProcess.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    const endTime = process.hrtime(startTime);
                    const executionTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds

                    resolve({
                        status: code === 0 ? 'success' : 'error',
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        executionTime: executionTime.toFixed(2)
                    });
                });

                pythonProcess.on('error', (error) => {
                    reject(error);
                });

                // Set timeout for execution (5 seconds)
                setTimeout(() => {
                    pythonProcess.kill();
                    reject(new Error('Execution timed out'));
                }, 5000);
            });

            executionOutput = await outputPromise;
        } else {
            throw new Error('Unsupported language');
        }

        // Clean up the temporary file
        fs.unlinkSync(filePath);

        return executionOutput;
    } catch (error) {
        // Clean up the temporary file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return {
            status: 'error',
            error: error.message,
            stderr: executionOutput.stderr
        };
    }
}

function getExtension(language) {
    switch (language) {
        case 'cpp':
            return 'cpp';
        case 'python':
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
        case 'python':
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
        case 'python':
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
