const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');
const { getProfile, deleteAccount } = require('../controllers/profileController');

// New explicit "me" endpoint 👇
router.get('/me', auth, getProfile);

// (optional) keep the root path too
router.get('/',   auth, getProfile);

// Delete account
router.delete('/', auth, rateLimiter, deleteAccount);

module.exports = router;