const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lenderSchema = new Schema({
  name: String,
  amount: Number,
  interest: Number,
  duration: String,
   
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number], // [longitude, latitude]
  },
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sentTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
});

lenderSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Lender', lenderSchema);
