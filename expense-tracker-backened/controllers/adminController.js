const mongoose = require('mongoose');
const User     = require('../models/User');
const Income   = require('../models/Income');
const Expense  = require('../models/Expense');

/* ─────────────────────────────────────────────────────────────
   GET /api/admin/users – list every user (+manager name)
────────────────────────────────────────────────────────────── */
exports.getAllUsers = async (_req, res) => {
  try {
    const users = await User.find()
      .populate('managerId', 'name')
      .select('_id name email role managerId permissions');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE /api/admin/users/:id – remove user + their data
────────────────────────────────────────────────────────────── */
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ error: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    await Income.deleteMany({ userId: req.params.id });
    await Expense.deleteMany({ userId: req.params.id });
    res.json({ message: 'User and their data deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

/* helper: validate ObjectId */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ─────────────────────────────────────────────────────────────
   GET /api/admin/users/:id/incomes
────────────────────────────────────────────────────────────── */
exports.getUserIncomes = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return res.status(400).json({ error: 'Invalid userId' });

  try {
    const incomes = await Income.find({ userId: id });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching incomes' });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/admin/users/:id/expenses
────────────────────────────────────────────────────────────── */
exports.getUserExpenses = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return res.status(400).json({ error: 'Invalid userId' });

  try {
    const expenses = await Expense.find({ userId: id });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching expenses' });
  }
};

/* ─────────────────────────────────────────────────────────────
   PUT /api/admin/users/:id – update role / manager / permissions
────────────────────────────────────────────────────────────── */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res.status(400).json({ error: 'Invalid userId' });

    const allowedRoles = ['user', 'manager'];
    const { role, managerId, permissions } = req.body;

    if (role && !allowedRoles.includes(role))
      return res.status(400).json({ error: 'Invalid role' });

    if (id === req.user.id)
      return res.status(400).json({ error: 'Cannot change your own role' });

    const update = {
      ...(role       !== undefined && { role }),
      ...(permissions !== undefined && { permissions }),
      managerId: managerId || null
    };

    await User.findByIdAndUpdate(id, update);
    res.json({ message: 'User role / manager / permissions updated' });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating user' });
  }
};
