const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  duration: { type: String, required: true },
  status: { type: String, enum: ['active', 'completed', 'defaulted'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: Date
});

module.exports = mongoose.model('Transaction', transactionSchema);