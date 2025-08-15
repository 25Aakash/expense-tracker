// validation/authSchemas.js
const Joi = require('joi');

// ── registration ─────────────────────────────────────────────
exports.registerRequest = Joi.object({
  name:     Joi.string().trim().min(1).required(),
  email:    Joi.string().email().required(),
  mobile:   Joi.string().pattern(/^\d{10}$/).required(),
  password: Joi.string().min(8).required(),
});

// ── login ────────────────────────────────────────────────────
exports.login = Joi.object({
  identifier: Joi.string().required(),  // email or mobile
  password:   Joi.string().required(),  // any length (legacy support)
});

// ── OTP-based password reset ─────────────────────────────────
exports.requestReset = Joi.object({
  email: Joi.string().email().required(),
});

exports.confirmReset = Joi.object({
  email:       Joi.string().email().required(),
  otp:         Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required(),
});

// ── in-session password change ───────────────────────────────
exports.changePassword = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword:     Joi.string().min(8).required(),
});
