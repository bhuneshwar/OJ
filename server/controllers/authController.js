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

    if (!(firstname && lastname && email && password)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const username = await generateUsername(firstname, lastname);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: newUser._id, email }, process.env.SECRET_KEY, { expiresIn: "1h" });

    // Securely set the cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Must be true in production (HTTPS)
      sameSite: "None", // Required for cross-origin cookies
    });

    res.status(201).json({ message: "Registration successful", username });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Must be true in production (HTTPS)
      sameSite: "None", // Required for cross-origin cookies
    });

    res.status(200).json({ message: "Login successful", username: user.username });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Logout user
exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};
