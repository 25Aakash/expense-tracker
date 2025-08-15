import axios from 'axios';
import { toast } from 'react-toastify';

const API = axios.create({
  baseURL: 'https://expense-tracker-hirq.onrender.com/api'
});

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      toast.error('Session expired, please log in again.');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const registerRequest = d => API.post('/auth/register-request', d);
export const resendOtp = d => API.post('/auth/resend-otp', d);
export const verifyOtp = d => API.post('/auth/verify-otp', d);
export const login = d => API.post('/auth/login', d);
export const requestReset = d => API.post('/auth/request-reset', d);
export const confirmReset = d => API.post('/auth/confirm-reset', d);
export const changePassword = d => API.post('/auth/change-password', d);

export const getExpenses = () => API.get('/expenses');
export const addExpense = d => API.post('/expenses/add', d);
export const deleteExpense = id => API.delete(`/expenses/${id}`);

export const getIncomes = () => API.get('/incomes');
export const addIncome = d => API.post('/incomes/add', d);
export const deleteIncome = id => API.delete(`/incomes/${id}`);

export const addExpenseCategory = d => API.put('/user/categories/expense', d);
export const addIncomeCategory = d => API.put('/user/categories/income', d);

export const getProfile = () => API.get('/profile');
export const updateProfile = d => API.put('/profile', d);

export const getTeamUsers = () => API.get('/manager/team-users');
export const addUserUnderManager = d => API.post('/manager/add-user', d);
export const deleteUserUnderManager = (id) =>API.delete(`/manager/user/${id}`);
export const updateUserPermissions = (id, permissions) =>API.put(`/manager/permissions/${id}`, { permissions });

export const getAllUsers      = () => API.get('/admin/users');
export const deleteUser       = (id) => API.delete(`/admin/users/${id}`);
export const getUserIncomes   = (id) => API.get(`/admin/users/${id}/incomes`);
export const getUserExpenses  = (id) => API.get(`/admin/users/${id}/expenses`);
export const updateUserRole = (id, body) =>API.put(`/admin/users/${id}`, body);

export default API;
