// middleware/checkPermission.js
const User = require('../models/User');

module.exports = (perm) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('role permissions');
    if (user.role === 'admin' || user.permissions?.[perm]) return next();
    return res.status(403).json({ error: 'Permission denied' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error checking permission' });
  }
};
