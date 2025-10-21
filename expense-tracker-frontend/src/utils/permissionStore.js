// src/utils/permissionStore.js
let listeners = [];
let perms = JSON.parse(localStorage.getItem('permissions') || sessionStorage.getItem('permissions') || '{}');

export function getPerms() {
  return perms;
}

export function subscribe(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(fn => fn !== callback);
  };
}

export function updatePerms(newPerms) {
  perms = newPerms;
  // Save to the same storage type as the current session
  const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
  storage.setItem('permissions', JSON.stringify(newPerms));
  listeners.forEach(fn => fn());
}
