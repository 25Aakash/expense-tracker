const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { getProfile } = require('../controllers/profileController');

// New explicit “me” endpoint 👇
router.get('/me', auth, getProfile);

// (optional) keep the root path too
router.get('/',   auth, getProfile);

module.exports = router;