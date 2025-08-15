const express = require('express');
const router = express.Router();
const auth   = require('../middleware/auth');
const {
  getAllUsers,
  deleteUser,
  getUserIncomes,
  getUserExpenses,
  updateUserRole,
} = require('../controllers/adminController');

router.get('/users',            auth, getAllUsers);
router.delete('/users/:id',      auth, deleteUser);
router.get('/users/:id/incomes', auth, getUserIncomes);
router.get('/users/:id/expenses',auth, getUserExpenses);
router.put('/users/:id/role',    auth, updateUserRole);

module.exports = router;
