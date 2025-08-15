const { Schema, model } = require('mongoose');

const otpSchema = new Schema(
  {
    email:    { type: String, required: true, unique: true },
    code:     { type: String, required: true },
    expires:  { type: Date,   required: true },
    attempts: { type: Number, default: 0 },
    formData: { type: Object, required: true },
  },
  { timestamps: true }
);

module.exports = model('Otp', otpSchema);
