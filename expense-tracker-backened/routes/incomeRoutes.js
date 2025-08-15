const express = require('express');
const router = express.Router();
const Joi       = require('joi');
const auth      = require('../middleware/auth');
const validate  = require('../middleware/validate');
const can       = require('../middleware/checkPermission');
const {
  addIncome,
  getIncomes,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');

const incomeSchema = Joi.object({
  amount:   Joi.number().positive().required(),
  category: Joi.string().required(),
  note:     Joi.string().allow(''),
  method:   Joi.string().required(),
  date:     Joi.date().required(),
});

router.post('/add',          auth, validate(incomeSchema), addIncome);
router.get('/',           auth,                  getIncomes);
router.put('/:id',  auth, can('canEdit'), updateIncome);
router.delete('/:id',     auth, can('canDelete'), deleteIncome);

module.exports = router;
