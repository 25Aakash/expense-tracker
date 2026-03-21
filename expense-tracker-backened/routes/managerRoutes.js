// routes/managerRoutes.js
const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const { addUserUnderManager: addUserSchema } = require('../validation/permissionSchemas');
const mgrCtl   = require('../controllers/managerController');

const managerOrAdmin = requireRole('manager', 'admin');

router.get ('/team-transactions', auth, managerOrAdmin, mgrCtl.getTeamTransactions);
router.get ('/team-users',        auth, managerOrAdmin, mgrCtl.getTeamUsers);
router.get ('/user/:id',          auth, managerOrAdmin, mgrCtl.getManagedUser);
router.get ('/user/:id/incomes',  auth, managerOrAdmin, mgrCtl.getManagedUserIncomes);
router.get ('/user/:id/expenses', auth, managerOrAdmin, mgrCtl.getManagedUserExpenses);
router.post('/add-user',          auth, managerOrAdmin, validate(addUserSchema), mgrCtl.addUserUnderManager);
router.put ('/permissions/:id',   auth, managerOrAdmin, mgrCtl.updateUserPermissions);
router.delete('/user/:id',        auth, managerOrAdmin, mgrCtl.deleteManagedUser);   // ← NEW

module.exports = router;
