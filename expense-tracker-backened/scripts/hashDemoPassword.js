// Run this script with: node scripts/hashDemoPassword.js
const bcrypt = require('bcryptjs');

bcrypt.hash('Demo@1234', 10).then(hash => {
  console.log('Bcrypt hash for Demo@1234:', hash);
  process.exit(0);
});
