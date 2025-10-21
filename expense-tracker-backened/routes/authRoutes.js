// routes/authRoutes.js
const express      = require('express');
const router       = express.Router();

const rateLimiter  = require('../middleware/rateLimiter');
const auth         = require('../middleware/auth');
const validate     = require('../middleware/validate');
const schemas      = require('../validation/authSchemas');

const {
  registerRequest,
  resendOtp,
  verifyOtp,
  login,
  requestReset,
  confirmReset,
  changePassword,
  verifyToken,
  logout,
} = require('../controllers/authController');

// ── Registration & OTP ───────────────────────────────────────
router.post('/register-request', rateLimiter, validate(schemas.registerRequest), registerRequest);
router.post('/resend-otp',       rateLimiter, resendOtp);
router.post('/verify-otp', verifyOtp);

// ── Login ────────────────────────────────────────────────────
router.post('/login', validate(schemas.login), login);
router.get('/verify', auth, verifyToken);
router.post('/logout', auth, logout);

// ── Forgot-password (OTP reset) ──────────────────────────────
router.post('/request-reset',  rateLimiter, validate(schemas.requestReset),  requestReset);
router.post('/confirm-reset',  rateLimiter, validate(schemas.confirmReset),  confirmReset);

// ── Logged-in password change ───────────────────────────────
router.post('/change-password', auth, validate(schemas.changePassword), changePassword);
// compatibility route for mobile expecting PUT /profile/change-password
router.put('/change-password', auth, validate(schemas.changePassword), changePassword);

module.exports = router;
