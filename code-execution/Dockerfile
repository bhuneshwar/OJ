FROM ubuntu:22.04

# Install required compilers and tools
RUN apt-get update && apt-get install -y \
    python3 \
    nodejs \
    npm \
    default-jdk \
    g++ \
    bc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the worker scripts
COPY worker.sh /app/worker.sh
COPY worker.js /app/worker.js
RUN chmod +x /app/worker.sh

# Install Node.js dependencies
RUN npm init -y && npm install amqplib

# Start the Node.js worker script
CMD ["node", "/app/worker.js"]