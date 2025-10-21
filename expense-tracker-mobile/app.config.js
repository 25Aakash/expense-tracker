// Dynamic Expo config (SDK 54)
// Allows EXPO_PUBLIC_API_URL to be provided at build/run time.

export default ({ config }) => {
  return {
    ...config,
    name: config.name || 'ExpenseTracker',
    slug: config.slug || 'expense-tracker-mobile',
    version: config.version || '1.0.0',
    extra: {
      // Automatically expose to the app at runtime via process.env
    },
    updates: {
      enabled: true,
    },
  };
};
