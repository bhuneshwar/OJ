const amqp = require('amqplib');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function startWorker() {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://admin:password@rabbitmq:5672');
        const channel = await connection.createChannel();
        const queue = 'code_execution_queue';

        // Ensure the queue exists
        await channel.assertQueue(queue, { durable: true });

        console.log('Code execution worker is waiting for tasks...');

        // Consume tasks from the queue
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const task = JSON.parse(msg.content.toString());
                const { code, language, problemId, isSubmission, submissionId, userId } = task;

                try {
                    // Execute the code
                    const executionResult = await executeCode(code, language);
                    console.log('Execution result:', executionResult);

                    // Send the result back to the backend
                    // In a real implementation, you would send this back to the backend
                    // For now, we'll just log it
                    console.log('Task processed successfully:', executionResult);

                    // Acknowledge the message
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing task:', error);
                    channel.ack(msg); // Acknowledge even on error to prevent queue blocking
                }
            }
        });
    } catch (error) {
        console.error('Worker error:', error);
        // Retry connection after a delay
        setTimeout(startWorker, 5000);
    }
}

async function executeCode(code, language) {
    const timestamp = Date.now();
    const codeDir = path.join('/app/code');
    
    if (!fs.existsSync(codeDir)) {
        fs.mkdirSync(codeDir, { recursive: true });
    }

    const fileName = `code_${timestamp}.${getExtension(language)}`;
    const filePath = path.join(codeDir, fileName);
    fs.writeFileSync(filePath, code);

    let executionOutput = {
        status: 'success',
        stdout: '',
        stderr: '',
        executionTime: 0,
        memoryUsage: 0
    };

    try {
        // Prepare the command based on language
        let cmd;
        switch (language) {
            case 'python':
                cmd = `/app/run_with_metrics python3 ${fileName}`;
                break;
            case 'javascript':
                cmd = `/app/run_with_metrics node ${fileName}`;
                break;
            case 'cpp':
                cmd = `/app/run_with_metrics bash -c "g++ ${fileName} -o output && ./output"`;
                break;
            case 'java':
                const className = fileName.replace('.java', '');
                cmd = `/app/run_with_metrics bash -c "javac ${fileName} && java -cp . ${className}"`;
                break;
            default:
                throw new Error('Unsupported language');
        }

        // Execute the command
        const { stdout, stderr } = await executeCommand(cmd, codeDir);
        
        // Parse execution time and memory usage from stdout
        let containerExecutionTime = 0;
        let memoryUsage = 0;
        
        const timeMatch = stdout.match(/EXECUTION_TIME=([0-9.]+)/);
        if (timeMatch && timeMatch[1]) {
            containerExecutionTime = parseFloat(timeMatch[1]);
        }
        
        const memoryMatch = stdout.match(/MEMORY_USAGE=([0-9]+)/);
        if (memoryMatch && memoryMatch[1]) {
            memoryUsage = parseInt(memoryMatch[1]);
        }

        // Clean up the output to remove the metrics lines
        let cleanOutput = stdout.replace(/EXECUTION_TIME=([0-9.]+)\n?/g, '');
        cleanOutput = cleanOutput.replace(/MEMORY_USAGE=([0-9]+)\n?/g, '');
        
        executionOutput = {
            status: 'success',
            stdout: cleanOutput,
            stderr: stderr,
            executionTime: containerExecutionTime.toFixed(2),
            memoryUsage: memoryUsage / 1024 // Convert to MB
        };
    } catch (error) {
        executionOutput = {
            status: 'error',
            error: error.message,
            stderr: error.message,
            executionTime: 0,
            memoryUsage: 0
        };
    } finally {
        // Clean up the file
        try {
            fs.unlinkSync(filePath);
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

function executeCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        const process = spawn('bash', ['-c', command], { cwd });
        
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        process.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`Command failed with code ${code}: ${stderr}`));
            }
        });
        
        process.on('error', (err) => {
            reject(err);
        });
    });
}

// Start the worker
startWorker().catch(err => {
    console.error('Failed to start worker:', err);
});