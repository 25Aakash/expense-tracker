# Expense Tracker Mobile (Expo)

## Overview
React Native + Expo mobile client for the Expense Tracker platform. Integrates with the backend API for authentication, expenses, incomes, categories, reporting, and role-based features.

## Running Locally
```bash
npm install
npm run start
```
Choose a platform (Android emulator / iOS simulator / Expo Go). Ensure your backend is reachable on the same network.

## API Configuration
Set an environment variable for the API base URL:

In `app.config.js` or `app.json` (using Expo env auto expose):
```js
// app.config.js
export default ({ config }) => ({
  ...config,
  extra: {},
  expo: {
    ...config.expo,
    name: 'ExpenseTracker',
  },
});
```
Then define `EXPO_PUBLIC_API_URL` before starting:
```bash
$env:EXPO_PUBLIC_API_URL="https://api.example.com/api"  # PowerShell
npm run start
```

Fallback (if not set): `http://127.0.0.1:5000/api`.

## Feature Flags / TODO
- Add offline caching for transactions
- Add biometric unlock (expo-local-authentication)
- Push notifications for reminders
- Integrate production analytics (replace `AnalyticsService` stubs)

## Build for Play Store
1. Login to Expo: `npx expo login`
2. Configure `eas.json` release channels.
3. Run build: `npx expo build:android` (managed workflow) or `npx eas build -p android --profile production`.
4. Upload generated AAB to Google Play Console.
5. Complete store listing (see `/store` guidance docs).

## Security Notes
- JWT stored in AsyncStorage (consider secure storage for production)
- Interceptor wipes token on 401 and should redirect to login (implement navigation reset in a global handler)

## Folder Structure
```
src/
  components/
  screens/
  services/ (api, analytics placeholder)
  context/ (AuthContext)
  navigation/
  hooks/
  utils/
```

## Testing (Planned)
- Unit test auth context (mock axios)
- Snapshot test key screens
- E2E via Detox (future)

## License
ISC
