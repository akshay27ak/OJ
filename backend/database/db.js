const mongoose = require('mongoose') ;
const dotenv = require('dotenv') ;
dotenv.config() ;

const DBConnection = async () => {
    const MONGO_URL = process.env.MONGODB_URL ;

    try {
        await mongoose.connect(MONGO_URL) ;
        console.log("DB Connection Established") ;
    }
    catch (error) {
        console.log("Error while connecting to MongoDB", error) ;
    }
} ;

module.exports = {DBConnection} ;