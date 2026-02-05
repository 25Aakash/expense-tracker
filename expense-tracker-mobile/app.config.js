// Dynamic Expo config (SDK 54)
// Allows EXPO_PUBLIC_API_URL to be provided at build/run time.

export default ({ config }) => {
  return {
    ...config,
    name: config.name || 'ExpenseTracker',
    slug: config.slug || 'expense-tracker-mobile',
    version: config.version || '1.0.0',
    android: {
      ...config.android,
      versionCode: 9,  // Incremented to 9 since 7 and 8 failed
    },
    extra: {
      ...config.extra,
      // Set the production API URL
      EXPO_PUBLIC_API_URL: 'https://expense-tracker-hirq.onrender.com/api',
    },
    updates: {
      ...config.updates,
      enabled: true,
    },
  };
};
