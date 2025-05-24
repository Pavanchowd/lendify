const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const borrowerSchema = new Schema({
  name: String,
   
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sentTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
});

borrowerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Borrower', borrowerSchema);
