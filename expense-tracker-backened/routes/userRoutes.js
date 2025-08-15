const express = require('express');
const router = express.Router();
const auth   = require('../middleware/auth');
const {
  getExpenseCategories,
  addExpenseCategory,
  deleteExpenseCategory,
  getIncomeCategories,
  addIncomeCategory,
  deleteIncomeCategory,
} = require('../controllers/userController');

router.get('/categories/expense',     auth, getExpenseCategories);
router.put('/categories/expense',     auth, addExpenseCategory);
router.delete('/categories/expense',  auth, deleteExpenseCategory);
router.get('/categories/income',      auth, getIncomeCategories);
router.put('/categories/income',      auth, addIncomeCategory);
router.delete('/categories/income',   auth, deleteIncomeCategory);

module.exports = router;
