// Centralized runtime configuration for API base URL resolution.
// Priority:
// 1. EXPO_PUBLIC_API_URL env (set in app.json / app.config.js)
// 2. Derive host from Expo dev host (LAN / tunnel) if available
// 3. Platform-specific localhost mapping (Android emulator vs iOS simulator)
// 4. Fallback to 127.0.0.1

import { Platform } from 'react-native';
import Constants from 'expo-constants';

function sanitize(url) {
  return url.replace(/\/$/, '');
}

function deriveFromExpoHost() {
  // For Expo Go in dev, hostUri often looks like: 192.168.1.5:8081 or 192.168.1.5:19000
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.hostUri;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  if (!host || /^(localhost|127\.0\.0\.1)$/.test(host)) return null;
  return `http://${host}:5000/api`;
}

function platformDefault() {
  if (Platform.OS === 'android') {
    // Android emulator maps 10.0.2.2 to host loopback
    return 'http://10.0.2.2:5000/api';
  }
  // iOS simulator & web dev can use localhost
  return 'http://localhost:5000/api';
}

function resolveBaseUrl() {
  // 1. Explicit env (now set in app.config.js)
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return sanitize(envUrl);

  // 2. Try to derive from Expo host (works for LAN testing)
  const derived = deriveFromExpoHost();
  if (derived) return derived;

  // 3. Production backend URL
  return 'https://expense-tracker-hirq.onrender.com/api';
}

export const API_BASE_URL = resolveBaseUrl();
export default { API_BASE_URL };
