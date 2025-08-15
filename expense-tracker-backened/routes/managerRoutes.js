// routes/managerRoutes.js
const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const mgrCtl   = require('../controllers/managerController');

router.get ('/team-transactions', auth, mgrCtl.getTeamTransactions);
router.get ('/team-users',        auth, mgrCtl.getTeamUsers);
router.get ('/user/:id',          auth, mgrCtl.getManagedUser);
router.get ('/user/:id/incomes',  auth, mgrCtl.getManagedUserIncomes);
router.get ('/user/:id/expenses', auth, mgrCtl.getManagedUserExpenses);
router.post('/add-user',          auth, mgrCtl.addUserUnderManager);
router.put ('/permissions/:id',   auth, mgrCtl.updateUserPermissions);
router.delete('/user/:id',        auth, mgrCtl.deleteManagedUser);   // ← NEW

module.exports = router;
