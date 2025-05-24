// models/Response.js (if not created yet)
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    interest: { type: Number, required: true },
    duration: { type: String, required: true },  // e.g., '6 months' 
});

module.exports = mongoose.model('Response', responseSchema);
