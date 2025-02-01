const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { DBConnection } = require('./database/db');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const problemRoutes = require('./routes/problemRoutes'); // Import problem routes
const leaderboardRoutes = require('./routes/leaderboardRoutes');

const app = express();
const port = process.env.PORT || 8080;

// Connect to MongoDB
DBConnection();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Enable cookie parsing

// Configure CORS to allow credentials (cookies)
app.use(cors({
  origin: 'http://localhost:3000', // Change this to match your frontend URL
  credentials: true, // Allow credentials (cookies)
}));

// Routes
app.use('/auth', authRoutes);
app.use('/problems', problemRoutes);
app.use('/', leaderboardRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
