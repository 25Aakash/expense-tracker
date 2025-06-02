const express = require('express');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');
const router = express.Router();

// Add Expense
router.post('/add', auth, async (req, res) => {
  const { title, amount, category, note, date } = req.body;
  const expense = new Expense({
    userId: req.user.id, title, amount, category, note, date
  });
  await expense.save();
  res.json({ message: "Expense added" });
});

// Get all expenses for user
router.get('/', auth, async (req, res) => {
  const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
  res.json(expenses);
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

module.exports = router;
