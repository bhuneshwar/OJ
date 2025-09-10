require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const connectDatabase = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const problemRoutes = require('./routes/problems');
const submissionRoutes = require('./routes/submissions');
const contestRoutes = require('./routes/contests');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Trust proxy for production deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'Online Judge API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      problems: '/api/problems',
      submissions: '/api/submissions',
      contests: '/api/contests',
      admin: '/api/admin',
      analytics: '/api/analytics'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);
  
  // Join room for real-time updates
  socket.on('join-room', (room) => {
    socket.join(room);
    logger.debug(`Socket ${socket.id} joined room: ${room}`);
  });
  
  // Leave room
  socket.on('leave-room', (room) => {
    socket.leave(room);
    logger.debug(`Socket ${socket.id} left room: ${room}`);
  });
  
  // Handle submission updates
  socket.on('submission-update', (data) => {
    socket.to(`problem-${data.problemId}`).emit('submission-result', data);
    socket.to(`user-${data.userId}`).emit('submission-result', data);
  });
  
  // Handle contest updates
  socket.on('contest-update', (data) => {
    socket.to(`contest-${data.contestId}`).emit('contest-update', data);
  });
  
  // Handle leaderboard updates
  socket.on('leaderboard-update', (data) => {
    socket.to(`contest-${data.contestId}`).emit('leaderboard-update', data);
  });
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io available globally
global.io = io;

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`API documentation available at: http://localhost:${PORT}/api/status`);
    });
    
    // Handle server shutdown gracefully
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received, shutting down gracefully`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, server, io };
