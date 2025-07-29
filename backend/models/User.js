const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, default: null },
    lastName: { type: String, required: true, default: null },
    email: { type: String, required: true, default: null, unique: true },
    password: { type: String, required: true },

}) ;

module.exports = mongoose.model('User', userSchema); 