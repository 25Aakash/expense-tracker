// src/hooks/usePermissions.js
import { useSyncExternalStore } from 'react';
import { getPerms, subscribe } from '../utils/permissionStore';

export default function usePermissions() {
  return useSyncExternalStore(subscribe, getPerms);
}
