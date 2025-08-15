// src/utils/permissionStore.js
let listeners = [];
let perms = JSON.parse(localStorage.getItem('permissions') || '{}');

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
  localStorage.setItem('permissions', JSON.stringify(newPerms));
  listeners.forEach(fn => fn());
}
