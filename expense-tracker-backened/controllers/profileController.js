// controllers/profileController.js
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load profile' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Cascade delete all user data
    await Promise.all([
      Expense.deleteMany({ userId: req.user.id }),
      Income.deleteMany({ userId: req.user.id }),
      Otp.deleteMany({ email: user.email }),
    ]);

    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
