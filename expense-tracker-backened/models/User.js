const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobile: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user'
  },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isVerified: { type: Boolean, default: true },

  permissions: {
    canAdd: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canViewTeam: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canExport: { type: Boolean, default: false },
    canAccessReports: { type: Boolean, default: false }
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

module.exports = mongoose.model('User', userSchema);
