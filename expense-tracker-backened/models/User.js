const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minlength: 1,
    maxlength: 80,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    match: /.+@.+\..+/
  },
  mobile: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    match: /^\d{10}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // never return by default
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user'
  },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isVerified: { type: Boolean, default: false }, // set false until OTP verified

  permissions: {
    canAdd:            { type: Boolean, default: false },
    canEdit:           { type: Boolean, default: false },
    canDelete:         { type: Boolean, default: false },
    canViewTeam:       { type: Boolean, default: false },
    canManageUsers:    { type: Boolean, default: false },
    canExport:         { type: Boolean, default: false },
    canAccessReports:  { type: Boolean, default: false }
  },

  categories: {
    income: {
      type: [String],
      default: ['Salary', 'Business', 'Interest', 'Gifts']
    },
    expense: {
      type: [String],
      default: ['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment']
    }
  }
}, { timestamps: true });

// Ensure indexes (helpful in some environments where unique not auto-created)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobile: 1 }, { unique: true });

// Hash password when modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);
