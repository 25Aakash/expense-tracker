const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    const emailExists = await User.findOne({ email });
    const mobileExists = await User.findOne({ mobile });
    if (emailExists) return res.status(400).json({ error: "Email already exists" });
    if (mobileExists) return res.status(400).json({ error: "Mobile number already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, mobile, password: hashed });
    await user.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;

  const user = await User.findOne({
    $or: [
      { email: identifier },
      { mobile: identifier }
    ]
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

const token = jwt.sign(
  { id: user._id, name: user.name, isAdmin: user.isAdmin },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);
  res.json({ token, user: { name: user.name, email: user.email, mobile: user.mobile } });
});

module.exports = router;
