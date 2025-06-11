// middleware/admin.js
const User = require('../models/User');

const admin = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

module.exports = admin;
