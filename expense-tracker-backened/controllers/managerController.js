// controllers/managerController.js
const User    = require('../models/User');
const Income  = require('../models/Income');
const Expense = require('../models/Expense');

/* ───────── helpers ───────── */
const isManaged = (mgrId, user) => user && String(user.managerId) === String(mgrId);

/* ───────── GET all team txns ───────── */
exports.getTeamTransactions = async (req, res) => {
  const users   = await User.find({ managerId: req.user.id }).select('_id');
  const userIds = users.map(u => u._id);

  const [incomes, expenses] = await Promise.all([
    Income.find({ userId: { $in: userIds } }),
    Expense.find({ userId: { $in: userIds } }),
  ]);

  res.json({ incomes, expenses });
};

/* ───────── GET team users ───────── */
exports.getTeamUsers = async (req, res) => {
  const users = await User.find({ managerId: req.user.id })
    .select('_id name email permissions');
  res.json(users);
};

/* ───────── GET single managed user ───────── */
exports.getManagedUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('_id name email permissions managerId');
  if (!isManaged(req.user.id, user)) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

/* ───────── TXNs for a managed user ───────── */
exports.getManagedUserIncomes = async (req, res) => {
  const ok = await User.exists({ _id: req.params.id, managerId: req.user.id });
  if (!ok) return res.status(403).json({ error: 'Access denied' });
  res.json(await Income.find({ userId: req.params.id }));
};
exports.getManagedUserExpenses = async (req, res) => {
  const ok = await User.exists({ _id: req.params.id, managerId: req.user.id });
  if (!ok) return res.status(403).json({ error: 'Access denied' });
  res.json(await Expense.find({ userId: req.params.id }));
};

/* ───────── ADD user under manager ───────── */
exports.addUserUnderManager = async (req, res) => {
  const { name, email, mobile, password, permissions } = req.body;
  if (await User.exists({ email })) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  // Don't manually hash - the User model's pre-save hook will handle it
  await User.create({
    name, email, mobile,
    password,  // Pass plain password - will be hashed by pre-save hook
    role     : 'user',
    managerId: req.user.id,
    isVerified: true,
    permissions: permissions || {},
  });
  res.status(201).json({ message: 'User added' });
};

/* ───────── UPDATE perms ───────── */
exports.updateUserPermissions = async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, managerId: req.user.id },
    { permissions: req.body.permissions },
    { new: true }
  );
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Permissions updated' });
};

/* ───────── DELETE user under manager ───────── */
exports.deleteManagedUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, managerId: req.user.id });
  if (!user) return res.status(404).json({ error: 'User not found' });

  await Promise.all([
    Income.deleteMany({ userId: user._id }),
    Expense.deleteMany({ userId: user._id }),
    user.deleteOne(),
  ]);
  res.json({ message: 'User & data deleted' });
};
