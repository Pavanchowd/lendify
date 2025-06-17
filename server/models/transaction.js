 const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  lenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: Number,
  interest: Number,
  duration: String,
  
});

module.exports = mongoose.model('Transaction', transactionSchema);
