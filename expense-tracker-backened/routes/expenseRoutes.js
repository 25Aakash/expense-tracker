const express = require('express');
const router = express.Router();
const Joi       = require('joi');
const auth      = require('../middleware/auth');
const validate  = require('../middleware/validate');
const can       = require('../middleware/checkPermission');
const {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

const expenseSchema = Joi.object({
  amount:   Joi.number().positive().required(),
  category: Joi.string().required(),
  note:     Joi.string().allow(''),
  method:   Joi.string().required(),
  date:     Joi.date().required(),
});

router.post('/add',          auth, validate(expenseSchema), addExpense);
router.get('/',           auth,                  getExpenses);
router.put('/:id',  auth, can('canEdit'), updateExpense);
router.delete('/:id',     auth, can('canDelete'), deleteExpense);

module.exports = router;
