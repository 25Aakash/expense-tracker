const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: Number,
  category: String,
  note: String,
  date: Date,
  method: String
});

module.exports = mongoose.model('Income', incomeSchema);
