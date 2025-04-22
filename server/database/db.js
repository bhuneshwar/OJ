const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()

const MONGO_URL = process.env.MONGODB_URI

const DBConnection = async() => {
    try{
        await mongoose.connect(MONGO_URL, {useNewUrlParser: true});
        console.log('Connected to MongoDB');
    }
    catch(error){
        console.log("Error while connecting with the DB", error.message);;
    }
};

module.exports = {DBConnection};