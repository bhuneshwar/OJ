// controllers/problemController.js

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const Problem = require('../models/Problem');
const Solution = require('../models/Solution');
const amqp = require('amqplib');
const Docker = require('dockerode');

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


// Controller to run code (publishes task to RabbitMQ)
exports.runProblemById = async (req, res) => {
    try {
        const { code, language, input } = req.body;
        const problemId = req.params.id;

        // Input validation
        if (!code || !language) {
            return res.status(400).json({ error: 'Code and language are required' });
        }

        // Connect to RabbitMQ
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'code_execution_queue';

        // Ensure the queue exists
        await channel.assertQueue(queue, { durable: true });

        // Publish the task to the queue
        const task = { code, language, input, problemId, userId: req.user._id };
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(task)), { persistent: true });

        // Close the connection
        await channel.close();
        await connection.close();

        res.json({ status: 'success', message: 'Code execution task submitted' });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Server error occurred while submitting the task'
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
            executionTime: executionResult.executionTime,
            memoryUsage: executionResult.memoryUsage
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
    const docker = new Docker();
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
        executionTime: 0,
        memoryUsage: 0
    };

    const startTime = process.hrtime();

    try {
        // Define language-specific commands
        let cmd;
        switch (language) {
            case 'python':
                cmd = ['python', filePath];
                break;
            case 'javascript':
                cmd = ['node', filePath];
                break;
            case 'cpp':
                // Compile and run C++ code
                const compiledFileName = `output_${timestamp}`;
                const compiledFilePath = path.join(tempDir, compiledFileName);
                cmd = ['sh', '-c', `g++ ${filePath} -o ${compiledFilePath} && ${compiledFilePath}`];
                break;
            case 'java':
                // Compile and run Java code
                const className = fileName.replace('.java', '');
                cmd = ['sh', '-c', `javac ${filePath} && java -cp ${tempDir} ${className}`];
                break;
            default:
                throw new Error('Unsupported language');
        }

        // Create a directory for this execution in the temp directory
        const executionDir = path.join(tempDir, `exec_${timestamp}`);
        if (!fs.existsSync(executionDir)) {
            fs.mkdirSync(executionDir, { recursive: true });
        }
        
        // Move the file to the execution directory
        const newFilePath = path.join(executionDir, fileName);
        fs.renameSync(filePath, newFilePath);
        
        // Create and start Docker container
        const container = await docker.createContainer({
            Image: 'code-execution', // Ensure this image has all required compilers/tools
            // Construct the proper command based on language
            Cmd: ['bash', '-c', `cd /app/code && /app/run_with_metrics ${language === 'cpp' ? 
                `g++ ${fileName} -o output && ./output` : 
                language === 'java' ? 
                `javac ${fileName} && java -cp . ${fileName.replace('.java', '')}` : 
                language === 'python' ? 
                `python3 ${fileName}` : 
                `node ${fileName}`}`],
            HostConfig: {
                Memory: 256 * 1024 * 1024, // 256MB memory limit
                CpuPeriod: 100000,
                CpuQuota: 50000, // 50% CPU limit
                Binds: [`${executionDir}:/app/code`] // Mount the execution directory
            },
            WorkingDir: '/app/code'
        });

        await container.start();

        const output = await container.wait();
        const logs = await container.logs({ stdout: true, stderr: true });
        
        // Parse execution time and memory usage from logs
        const logOutput = logs.toString();
        let containerExecutionTime = 0;
        let memoryUsage = 0;
        
        const timeMatch = logOutput.match(/EXECUTION_TIME=([0-9.]+)/);
        if (timeMatch && timeMatch[1]) {
            containerExecutionTime = parseFloat(timeMatch[1]);
        }
        
        const memoryMatch = logOutput.match(/MEMORY_USAGE=([0-9]+)/);
        if (memoryMatch && memoryMatch[1]) {
            memoryUsage = parseInt(memoryMatch[1]);
        }

        const endTime = process.hrtime(startTime);
        const totalExecutionTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds

        // Clean up the log output to remove the metrics lines
        let cleanOutput = logOutput.replace(/EXECUTION_TIME=([0-9.]+)\n?/g, '');
        cleanOutput = cleanOutput.replace(/MEMORY_USAGE=([0-9]+)\n?/g, '');
        
        executionOutput = {
            status: output.StatusCode === 0 ? 'success' : 'error',
            stdout: cleanOutput,
            stderr: '',
            executionTime: containerExecutionTime > 0 ? containerExecutionTime.toFixed(2) : totalExecutionTime.toFixed(2),
            memoryUsage: memoryUsage / 1024 // Convert to MB
        };

        await container.remove();
    } catch (error) {
        executionOutput = {
            status: 'error',
            error: error.message,
            stderr: error.message,
            executionTime: 0,
            memoryUsage: 0
        };
    } finally {
        // Clean up the temporary files and directories
        try {
            // Clean up the execution directory
            if (fs.existsSync(executionDir)) {
                const files = fs.readdirSync(executionDir);
                files.forEach(file => {
                    fs.unlinkSync(path.join(executionDir, file));
                });
                fs.rmdirSync(executionDir);
            }
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
    }

    return executionOutput;
}

function getExtension(language) {
    switch (language) {
        case 'python':
            return 'py';
        case 'javascript':
            return 'js';
        case 'cpp':
            return 'cpp';
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