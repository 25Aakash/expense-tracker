const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Get all users
router.get('/users', auth, admin, async (req, res) => {
  const users = await User.find().select('_id email isAdmin');
  res.json(users);
});

router.delete('/users/:id', auth, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  await Income.deleteMany({ userId: req.params.id });
  await Expense.deleteMany({ userId: req.params.id });
  res.json({ message: 'User and their data deleted' });
});

// Get a user's incomes
router.get('/users/:id/incomes', auth, admin, async (req, res) => {
  const incomes = await Income.find({ userId: req.params.id });
  res.json(incomes);
});

// Get a user's expenses
router.get('/users/:id/expenses', auth, admin, async (req, res) => {
  const expenses = await Expense.find({ userId: req.params.id });
  res.json(expenses);
});

module.exports = router;
