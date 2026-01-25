// Script to create a demo user for Play Store reviewers
const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';

async function createDemoUser() {
  await mongoose.connect(MONGO_URI);
  const demoMobile = '9999999999';
  const demoEmail = 'demo@dailycashbook.com';
  const demoPassword = 'Demo@1234';

  // Remove existing demo user if present
  await User.deleteOne({ $or: [{ mobile: demoMobile }, { email: demoEmail }] });

  const user = new User({
    name: 'Demo User',
    email: demoEmail,
    mobile: demoMobile,
    password: demoPassword,
    isVerified: true,
    permissions: {
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canViewTeam: true,
      canManageUsers: true,
      canExport: true,
      canAccessReports: true
    }
  });
  await user.save();
  console.log('Demo user created:', demoMobile, demoPassword);
  await mongoose.disconnect();
}

createDemoUser().catch(e => { console.error(e); process.exit(1); });
