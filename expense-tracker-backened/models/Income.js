const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  note: String,
  date: { type: Date, required: true },
  method: { type: String, required: true }
});

module.exports = mongoose.model('Income', incomeSchema);
