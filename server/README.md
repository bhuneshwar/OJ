# Online Judge Backend

A comprehensive backend system for an online judge platform supporting competitive programming problems, contests, and user management.

## Features

### 🔐 Authentication & User Management
- JWT-based authentication
- User registration and login
- Profile management
- Role-based access control (User, Moderator, Admin)
- User statistics and achievements

### 📝 Problem Management
- Create and manage programming problems
- Support for multiple difficulty levels
- Test case management
- Problem categorization with tags
- Rich text descriptions with constraints

### ⚡ Code Execution System
- Multi-language support (Python, Java, C++, JavaScript, etc.)
- Secure sandboxed execution
- Time and memory limit enforcement
- Real-time execution results

### 🏆 Contest System
- Create and manage programming contests
- ICPC and IOI style scoring
- Real-time leaderboards
- Contest registration and management
- Clarification system
- Contest analytics

### 📊 Analytics & Monitoring
- User activity tracking
- Problem statistics
- Contest analytics
- System health monitoring
- Performance metrics

### 👨‍💼 Admin Panel
- User management and moderation
- Problem approval and management
- Contest oversight
- System monitoring and logs
- Platform statistics

### 🔔 Real-time Features
- WebSocket-based real-time updates
- Live contest updates
- Real-time submission results
- Live leaderboards

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.IO
- **Message Queue:** RabbitMQ
- **Code Execution:** Docker containers
- **Logging:** Winston
- **Security:** Helmet, Rate limiting, CORS
- **Validation:** Express Validator

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- RabbitMQ (optional, for code execution)
- Docker (optional, for secure code execution)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd online-judge-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Or use your local MongoDB installation
mongod
```

5. **Start RabbitMQ (optional):**
```bash
# Using Docker
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management

# Or use your local RabbitMQ installation
rabbitmq-server
```

6. **Start the server:**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start

# Start code execution worker
npm run worker
```

The server will start at `http://localhost:5000` by default.

### Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```env
# Required
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/onlinejudge
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:3000

# Optional
RABBITMQ_URL=amqp://localhost:5672
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## API Documentation

Detailed API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick API Overview

**Base URL:** `http://localhost:5000/api`

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

#### Problems
- `GET /problems` - List all problems
- `GET /problems/:id` - Get problem details
- `POST /problems` - Create problem (admin only)
- `POST /problems/:id/submit` - Submit solution

#### Contests
- `GET /contests` - List contests
- `GET /contests/:id` - Get contest details
- `POST /contests` - Create contest (admin only)
- `POST /contests/:id/register` - Register for contest

#### Admin
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/users` - Manage users
- `GET /admin/problems` - Manage problems
- `GET /admin/system/health` - System health

## Project Structure

```
server/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── problemController.js
│   ├── contestController.js
│   ├── adminController.js
│   └── analyticsController.js
├── models/               # Database models
│   ├── User.js
│   ├── Problem.js
│   ├── Contest.js
│   ├── Submission.js
│   └── Solution.js
├── routes/               # API routes
│   ├── auth.js
│   ├── problems.js
│   ├── contests.js
│   ├── admin.js
│   └── analytics.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── validate.js
├── utils/                # Utility functions
│   └── logger.js
├── workers/              # Background workers
│   └── codeExecutionWorker.js
├── logs/                 # Application logs
├── config/               # Configuration files
│   └── database.js
└── index.js              # Main application file
```

## Database Models

### User
- Profile information (username, email, name)
- Authentication data (hashed password)
- Statistics (problems solved, rating, rank)
- Preferences and settings

### Problem
- Problem details (title, description, constraints)
- Test cases and sample inputs/outputs
- Metadata (difficulty, tags, author)
- Statistics (submission count, acceptance rate)

### Contest
- Contest information (title, description, type)
- Timing (start/end time, duration)
- Problems and participants
- Leaderboard and rankings

### Submission
- User and problem references
- Code and language
- Execution results (status, time, memory)
- Timestamps and metadata

## Security Features

- **Authentication:** JWT-based stateless authentication
- **Authorization:** Role-based access control
- **Rate Limiting:** Configurable rate limits to prevent abuse
- **Input Validation:** Comprehensive request validation
- **Security Headers:** Helmet.js for security headers
- **CORS:** Configurable CORS policies
- **Password Hashing:** bcrypt with salt rounds

## Code Execution

The system supports secure code execution through:

1. **RabbitMQ Queue:** Submissions are queued for processing
2. **Worker Process:** Dedicated worker processes execute code
3. **Docker Containers:** Sandboxed execution environment
4. **Resource Limits:** Time and memory constraints
5. **Multiple Languages:** Support for various programming languages

### Supported Languages
- Python (3.x)
- Java (OpenJDK)
- C++ (GCC)
- JavaScript (Node.js)
- C (GCC)
- C# (.NET Core)
- Go
- Rust
- PHP
- Ruby

## Real-time Features

WebSocket connections provide real-time updates for:
- Submission results
- Contest leaderboards
- System notifications
- Contest clarifications

Connect to `ws://localhost:5000` and listen for events:
- `submission-result`
- `contest-update`
- `leaderboard-update`

## Monitoring & Analytics

The system includes comprehensive monitoring:
- **Health Checks:** `/health` endpoint for system status
- **Performance Metrics:** Response times and system load
- **User Analytics:** Activity tracking and statistics
- **Error Logging:** Structured logging with Winston
- **Admin Dashboard:** Real-time system overview

## Testing

```bash
# Run syntax check
node -c index.js

# Test API endpoints with curl
curl -X GET http://localhost:5000/health
curl -X GET http://localhost:5000/api/status
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t online-judge-backend .

# Run container
docker run -p 5000:5000 -e MONGODB_URI=mongodb://host.docker.internal:27017/onlinejudge online-judge-backend
```

### Production Considerations

1. **Environment Variables:** Set production values
2. **Database:** Use MongoDB Atlas or dedicated instance
3. **Process Management:** Use PM2 or similar
4. **Reverse Proxy:** Nginx for SSL and load balancing
5. **Monitoring:** Set up application monitoring
6. **Backups:** Regular database backups

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development Workflow

1. **Setup:** Follow installation instructions
2. **Development:** Use `npm run dev` for auto-restart
3. **Testing:** Test endpoints with API client
4. **Code Quality:** Follow existing code style
5. **Documentation:** Update docs for new features

## Troubleshooting

### Common Issues

**Database Connection Error:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

**JWT Authentication Issues:**
- Check JWT_SECRET is set
- Verify token format and expiration
- Ensure proper Authorization header

**Code Execution Problems:**
- Check RabbitMQ connection
- Verify worker process is running
- Check Docker setup for sandboxing

### Logs

Application logs are stored in the `logs/` directory:
- `combined.log` - All log levels
- `error.log` - Error messages only

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Roadmap

Future enhancements:
- [ ] Advanced plagiarism detection
- [ ] Multi-contest tournaments
- [ ] Team-based contests
- [ ] Mobile API optimization
- [ ] Advanced analytics dashboard
- [ ] Integration with external judges
