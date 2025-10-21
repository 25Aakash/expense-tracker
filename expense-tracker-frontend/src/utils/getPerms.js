// src/utils/getPerms.js
export const getPerms = () =>
  JSON.parse(localStorage.getItem('permissions') || sessionStorage.getItem('permissions') || '{}');
