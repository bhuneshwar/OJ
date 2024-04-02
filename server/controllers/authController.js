// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
            // get all the data from the frontend
    const { firstname, lastname, email, password } = req.body;
    // check that all the data should exist
    if (!(firstname && lastname && email && password)) {
      return res.status(400).send("Please enter all the information");
    }
    // check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).send("User already exists");
    }

    // encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // save the user in the database and await the result
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword
    });
    // generate the token for the user and send it
    const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, { expiresIn: "1h" });
    user.token = token;
    user.password = undefined;
    res.status(200).json({
      message: "You have successfully registered",
      user
    });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
         //get all the data from frontend
    const {email, password} = req.body;

    //check that all the data should exist
    if(!(email && password)){
      return res.status(200).send("Please enter all information");
    }

    //Check if user already exists
    user = await User.findOne({email});
    if(!user){
      return res.status(200).send("User not found");
    }

    //match the password
    const enteredPassword = await bcrypt.compare(password, user.password);
    if(!enteredPassword){
      return res.status(400).send("Password is incorrect");
    }

    // generate the token for the user and send it
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1h" });
    user.token = token;
    user.password = undefined;

    //store cookies
    const options = {
      expires: new Date(Date.now() + 1*24*60*60*1000),
      httpOnly: true, //Only manupulated by server not by frontend user
        };

    //send the token
    res.status(200).cookie("token", token, options).json({
      message: "You hsve successfully logged in",
      success: true,
      token,
    });         
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};
