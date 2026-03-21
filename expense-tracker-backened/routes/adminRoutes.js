const express = require('express');
const router = express.Router();
const auth   = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getAllUsers,
  deleteUser,
  getUserIncomes,
  getUserExpenses,
  updateUserRole,
} = require('../controllers/adminController');

const adminOnly = requireRole('admin');

router.get('/users',            auth, adminOnly, getAllUsers);
router.delete('/users/:id',      auth, adminOnly, deleteUser);
router.get('/users/:id/incomes', auth, adminOnly, getUserIncomes);
router.get('/users/:id/expenses',auth, adminOnly, getUserExpenses);
router.put('/users/:id/role',    auth, adminOnly, updateUserRole);

module.exports = router;
