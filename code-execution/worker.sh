#!/bin/bash

echo "Worker is running and waiting for tasks..."

# Install required Node.js packages for RabbitMQ connection
if [ ! -d "/app/node_modules" ]; then
    echo "Installing required Node.js packages..."
    cd /app
    npm init -y
    npm install amqplib
fi

# Create directories for code execution
mkdir -p /app/code
cd /app

# Function to measure execution time and memory usage
run_with_metrics() {
    local start_time=$(date +%s.%N)
    local peak_memory=0
    
    # Start memory monitoring in background
    (
        while true; do
            local current_memory=$(ps -o rss= -p $$ | awk '{print $1}')
            if [ "$current_memory" -gt "$peak_memory" ]; then
                peak_memory=$current_memory
            fi
            sleep 0.1
        done
    ) & MONITOR_PID=$!
    
    # Run the actual command
    "$@"
    local exit_code=$?
    
    # Stop memory monitoring
    kill $MONITOR_PID 2>/dev/null
    
    # Calculate execution time
    local end_time=$(date +%s.%N)
    local execution_time=$(echo "$end_time - $start_time" | bc)
    
    # Output metrics
    echo "EXECUTION_TIME=$execution_time"
    echo "MEMORY_USAGE=$peak_memory"
    
    return $exit_code

# Create a proper executable script for run_with_metrics
cat > /app/run_with_metrics << 'EOF'
#!/bin/bash

start_time=$(date +%s.%N)
peak_memory=0

# Start memory monitoring in background
(
    while true; do
        current_memory=$(ps -o rss= -p $$ | awk '{print $1}')
        if [ "$current_memory" -gt "$peak_memory" ]; then
            peak_memory=$current_memory
        fi
        sleep 0.1
    done
) & MONITOR_PID=$!

# Run the actual command
"$@"
exit_code=$?

# Stop memory monitoring
kill $MONITOR_PID 2>/dev/null

# Calculate execution time
end_time=$(date +%s.%N)
execution_time=$(echo "$end_time - $start_time" | bc)

# Output metrics
echo "EXECUTION_TIME=$execution_time"
echo "MEMORY_USAGE=$peak_memory"

exit $exit_code
EOF

chmod +x /app/run_with_metrics

# Keep the container alive and ready to execute code
while true; do
    sleep 60
done