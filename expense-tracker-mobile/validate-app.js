/**
 * 🔍 AUTOMATED VALIDATION SCRIPT
 * This script checks for common issues in the Expense Tracker mobile app
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Expense Tracker App Validation...\n');

// Define the project root
const PROJECT_ROOT = path.join(__dirname);
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Check if essential files exist
const ESSENTIAL_FILES = [
  'App.js',
  'package.json',
  'app.json',
  'src/screens/LoginScreen.js',
  'src/screens/RegisterScreen.js',
  'src/screens/OTPVerificationScreen.js',
  'src/screens/DashboardScreen.js',
  'src/screens/AddExpenseScreen.js',
  'src/screens/AddIncomeScreen.js',
  'src/screens/TransactionsScreen.js',
  'src/screens/ProfileScreen.js',
  'src/context/AuthContext.js',
  'src/services/api.js',
  'src/navigation/MainTabNavigator.js'
];

const ESSENTIAL_DIRECTORIES = [
  'src',
  'src/screens',
  'src/components',
  'src/context',
  'src/services',
  'src/navigation'
];

console.log('📁 Checking essential files and directories...');

let missingFiles = [];
let missingDirs = [];

// Check directories
ESSENTIAL_DIRECTORIES.forEach(dir => {
  const fullPath = path.join(PROJECT_ROOT, dir);
  if (!fs.existsSync(fullPath)) {
    missingDirs.push(dir);
  }
});

// Check files
ESSENTIAL_FILES.forEach(file => {
  const fullPath = path.join(PROJECT_ROOT, file);
  if (!fs.existsSync(fullPath)) {
    missingFiles.push(file);
  }
});

// Report missing files/directories
if (missingDirs.length > 0) {
  console.log('❌ Missing directories:');
  missingDirs.forEach(dir => console.log(`   - ${dir}`));
} else {
  console.log('✅ All essential directories present');
}

if (missingFiles.length > 0) {
  console.log('❌ Missing files:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
} else {
  console.log('✅ All essential files present');
}

// Check package.json for essential dependencies
console.log('\n📦 Checking package.json dependencies...');

try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8'));
  
  const ESSENTIAL_DEPS = [
    '@react-navigation/native',
    '@react-navigation/native-stack',
    '@react-navigation/bottom-tabs',
    'react-native-paper',
    'expo-linear-gradient',
    '@expo/vector-icons',
    'react-native-safe-area-context',
    'axios',
    '@react-native-async-storage/async-storage'
  ];

  let missingDeps = [];
  ESSENTIAL_DEPS.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
      missingDeps.push(dep);
    }
  });

  if (missingDeps.length > 0) {
    console.log('❌ Missing dependencies:');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
  } else {
    console.log('✅ All essential dependencies present');
  }

} catch (error) {
  console.log('❌ Error reading package.json:', error.message);
}

// Check app.json for store readiness
console.log('\n🏪 Checking app.json for store readiness...');

try {
  const appJson = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'app.json'), 'utf8'));
  const expo = appJson.expo;

  const storeReadyChecks = [
    { key: 'name', value: expo.name, required: true },
    { key: 'slug', value: expo.slug, required: true },
    { key: 'version', value: expo.version, required: true },
    { key: 'icon', value: expo.icon, required: true },
    { key: 'splash.image', value: expo.splash?.image, required: true },
    { key: 'ios.bundleIdentifier', value: expo.ios?.bundleIdentifier, required: true },
    { key: 'android.package', value: expo.android?.package, required: true },
    { key: 'android.versionCode', value: expo.android?.versionCode, required: true }
  ];

  let storeIssues = [];
  storeReadyChecks.forEach(check => {
    if (check.required && !check.value) {
      storeIssues.push(check.key);
    }
  });

  if (storeIssues.length > 0) {
    console.log('❌ Store readiness issues:');
    storeIssues.forEach(issue => console.log(`   - Missing: ${issue}`));
  } else {
    console.log('✅ App.json appears store-ready');
  }

} catch (error) {
  console.log('❌ Error reading app.json:', error.message);
}

// Check for common React Native issues
console.log('\n🔍 Checking for common issues...');

// Check if navigation screens are properly imported
try {
  const appJsContent = fs.readFileSync(path.join(PROJECT_ROOT, 'App.js'), 'utf8');
  
  const expectedImports = [
    'LoginScreen',
    'RegisterScreen',
    'OTPVerificationScreen',
    'MainTabNavigator'
  ];

  let missingImports = [];
  expectedImports.forEach(importName => {
    if (!appJsContent.includes(importName)) {
      missingImports.push(importName);
    }
  });

  if (missingImports.length > 0) {
    console.log('❌ Missing imports in App.js:');
    missingImports.forEach(imp => console.log(`   - ${imp}`));
  } else {
    console.log('✅ All expected screens imported in App.js');
  }

} catch (error) {
  console.log('❌ Error checking App.js:', error.message);
}

// Generate final report
console.log('\n📊 VALIDATION SUMMARY');
console.log('========================');

const totalIssues = missingFiles.length + missingDirs.length;

if (totalIssues === 0) {
  console.log('✅ App structure looks good!');
  console.log('✅ Ready for manual testing phase');
} else {
  console.log(`❌ Found ${totalIssues} structural issues`);
  console.log('⚠️  Fix these issues before testing');
}

console.log('\n📋 NEXT STEPS:');
console.log('1. Fix any issues found above');
console.log('2. Run manual testing using MANUAL_TESTING_GUIDE.md');
console.log('3. Check DEPLOYMENT_TEST_CHECKLIST.md for comprehensive testing');
console.log('4. Test on real device/simulator');
console.log('5. Verify backend connectivity');

console.log('\n🚀 Happy Testing!');
