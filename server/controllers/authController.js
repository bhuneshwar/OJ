// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Function to generate a unique username
const generateUsername = async (firstname, lastname) => {
  let baseUsername = `${firstname.toLowerCase()}_${lastname.toLowerCase()}`;
  let username = baseUsername;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`; // Add a counter if username exists
    counter++;
  }
  return username;
};

// Register user
exports.register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // Validate required fields
    if (!(firstname && lastname && email && password)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Generate a unique username
    const username = await generateUsername(firstname, lastname);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, email }, process.env.SECRET_KEY, { expiresIn: "1h" });

    res.status(201).json({ message: "Registration successful", token, username });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!(email && password)) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token, username: user.username });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
