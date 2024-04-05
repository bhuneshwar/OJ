// // index.js
// const express = require('express');
// const mongoose = require('mongoose');

// const User = require('./models/User');
// const {DBConnection} = require('./database/db');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const cookie = require('cookie-parser');



// const app = express();
// const port = process.env.PORT || 8080;

// DBConnection();

// //Middlewares
// app.use(express.json());
// app.use(express.urlencoded({extended: true}));

// app.get('/', (req, res) => {
//   res.send("Hello World");
// })

// app.post('/register', async(req, res) => {
//   try {
//     // get all the data from the frontend
//     const { firstname, lastname, email, password } = req.body;
//     // check that all the data should exist
//     if (!(firstname && lastname && email && password)) {
//       return res.status(400).send("Please enter all the information");
//     }
//     // check if the user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(200).send("User already exists");
//     }

//     // encrypt the password
//     const hashedPassword = await bcrypt.hash(password, 10);
//     // save the user in the database and await the result
//     const user = await User.create({
//       firstname,
//       lastname,
//       email,
//       password: hashedPassword
//     });
//     // generate the token for the user and send it
//     const token = jwt.sign({ id: user._id, email }, process.env.SECRET_KEY, { expiresIn: "1h" });
//     user.token = token;
//     user.password = undefined;
//     res.status(200).json({
//       message: "You have successfully registered",
//       user
//     });
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.post("/login", async(req, res) => {

//   try{
//     //get all the data from frontend
//     const {email, password} = req.body;

//     //check that all the data should exist
//     if(!(email && password)){
//       return res.status(200).send("Please enter all information");
//     }

//     //Check if user already exists
//     user = await User.findOne({email});
//     if(!user){
//       return res.status(200).send("User not found");
//     }

//     //match the password
//     const enteredPassword = await bcrypt.compare(password, user.password);
//     if(!enteredPassword){
//       return res.status(400).send("Password is incorrect");
//     }

//     // generate the token for the user and send it
//     const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1h" });
//     user.token = token;
//     user.password = undefined;

//     //store cookies
//     const options = {
//       expires: new Date(Date.now() + 1*24*60*60*1000),
//       httpOnly: true, //Only manupulated by server not by frontend user
//         };

//     //send the token
//     res.status(200).cookie("token", token, options).json({
//       message: "You hsve successfully logged in",
//       success: true,
//       token,
//     });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
//       }
//       catch (error){
//         console.log(error.message);
//       }
    


// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });


// index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const {DBConnection} = require('./database/db');

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Connect to MongoDB
DBConnection();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/problems', problemRoutes);

// Default route
app.get('/', (req, res) => {
  res.send("Hello World");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
