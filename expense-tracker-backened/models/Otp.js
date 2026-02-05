const { Schema, model } = require('mongoose');

const otpSchema = new Schema(
  {
    email:    { type: String, sparse: true }, // Made optional, sparse allows multiple nulls
    mobile:   { type: String, sparse: true }, // Added for mobile-based OTP lookup
    code:     { type: String, required: true },
    expires:  { type: Date,   required: true },
    attempts: { type: Number, default: 0 },
    formData: { type: Object },
  },
  { timestamps: true }
);

// Create indexes for faster lookup (sparse to allow nulls)
otpSchema.index({ email: 1 }, { sparse: true, unique: true });
otpSchema.index({ mobile: 1 }, { sparse: true, unique: true });

module.exports = model('Otp', otpSchema);
