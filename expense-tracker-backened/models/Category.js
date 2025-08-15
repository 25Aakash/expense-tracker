const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  income: {
    type: [String],
    default: ['Salary', 'Business', 'Interest', 'Gifts', 'Other']
  },
  expense: {
    type: [String],
    default: ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Other']
  }
});

module.exports = mongoose.model('Category', categorySchema);
