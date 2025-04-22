const amqp = require('amqplib');
const { runCode } = require('../controllers/problemController');
const Solution = require('../models/Solution');

async function startWorker() {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'code_execution_queue';

        // Ensure the queue exists
        await channel.assertQueue(queue, { durable: true });

        console.log('Worker is waiting for tasks...');

        // Consume tasks from the queue
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const task = JSON.parse(msg.content.toString());
                const { code, language, input, problemId, isSubmission } = task;

                try {
                    // Execute the code
                    const executionResult = await runCode(code, language, problemId);

                    // Save the solution if this is a submission
                    if (isSubmission && task.submissionId) {
                        // Update the existing solution
                        await Solution.findByIdAndUpdate(task.submissionId, {
                            status: executionResult.status === 'success' ? 'Accepted' : 'Runtime Error',
                            executionTime: executionResult.executionTime,
                            memoryUsage: executionResult.memoryUsage
                        });
                    } else if (isSubmission) {
                        // Fallback if no submissionId is provided (backward compatibility)
                        const solution = new Solution({
                            user: task.userId,
                            problem: problemId,
                            code,
                            language,
                            status: executionResult.status === 'success' ? 'Accepted' : 'Runtime Error',
                            executionTime: executionResult.executionTime,
                            memoryUsage: executionResult.memoryUsage
                        });
                        await solution.save();
                    }

                    console.log('Task processed successfully:', executionResult);
                } catch (error) {
                    console.error('Error processing task:', error);
                }

                // Acknowledge the message
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Worker error:', error);
    }
}

// Export the function to be called from index.js
module.exports = { startWorker };

// Start the worker if this file is run directly
if (require.main === module) {
    startWorker();
}