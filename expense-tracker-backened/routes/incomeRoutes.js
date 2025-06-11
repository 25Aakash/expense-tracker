const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const auth = require('../middleware/auth');

// Add new income
router.post('/add', auth, async (req, res) => {
  try {
    const income = new Income({
      ...req.body,
      userId: req.user.id  // ✅ tie to user
    });
    await income.save();
    res.status(201).json(income);
  } catch (err) {
    res.status(400).json({ error: 'Failed to save income' });
  }
});

// Get all incomes for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

module.exports = router;
