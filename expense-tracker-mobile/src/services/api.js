import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

console.log('API Base URL:', API_BASE_URL); // Debug log

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout to 15 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { identifier: email, password }),
  registerRequest: (userData) => api.post('/auth/register-request', userData),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }),
  logout: () => api.post('/auth/logout'), // stateless
  verifyToken: () => api.get('/auth/verify'),
  getCurrentUser: () => api.get('/profile'),
  requestReset: (email) => api.post('/auth/request-reset', { email }),
  confirmReset: (email, otp, newPassword) => api.post('/auth/confirm-reset', { email, otp, newPassword }),
  changePassword: (currentPassword, newPassword) => api.post('/auth/change-password', { currentPassword, newPassword }),
};

// Expense API calls
export const expenseAPI = {
  getAll: (params = {}) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses/add', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getById: (id) => api.get(`/expenses/${id}`),
};

// Income API calls
export const incomeAPI = {
  getAll: (params = {}) => api.get('/incomes', { params }),
  create: (data) => api.post('/incomes/add', data),
  update: (id, data) => api.put(`/incomes/${id}`, data),
  delete: (id) => api.delete(`/incomes/${id}`),
  getById: (id) => api.get(`/incomes/${id}`),
};

// Profile API calls
export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
};

// Categories API calls
export const categoryAPI = {
  getAll: async () => {
    // Get both expense and income categories
    const [expenseRes, incomeRes] = await Promise.all([
      api.get('/user/categories/expense'),
      api.get('/user/categories/income')
    ]);

    // Combine and format the results
    const expenseCategories = (expenseRes.data.categories || []).map((cat, index) => ({
      _id: `expense_${index}_${cat}`,
      name: cat, // Use the real category name as stored in DB
      type: 'expense'
    }));

    const incomeCategories = (incomeRes.data.categories || []).map((cat, index) => ({
      _id: `income_${index}_${cat}`,
      name: cat, // Use the real category name as stored in DB
      type: 'income'
    }));

    return {
      data: [...expenseCategories, ...incomeCategories]
    };
  },
  create: (data) => {
    const endpoint = data.type === 'expense' 
      ? '/user/categories/expense' 
      : '/user/categories/income';
    return api.put(endpoint, { category: data.name });
  },
  delete: (category) => {
    // category: the full category object, with .type and .name
    const endpoint = category.type === 'expense'
      ? '/user/categories/expense'
      : '/user/categories/income';
    // Send only the category name as stored in DB
    return api.delete(endpoint, { data: { category: category.name } });
  },
  getExpenseCategories: () => api.get('/user/categories/expense'),
  getIncomeCategories: () => api.get('/user/categories/income'),
  addExpenseCategory: (name) => api.put('/user/categories/expense', { category: name }),
  addIncomeCategory: (name) => api.put('/user/categories/income', { category: name }),
  deleteExpenseCategory: (name) => api.delete('/user/categories/expense', { data: { category: name } }),
  deleteIncomeCategory: (name) => api.delete('/user/categories/income', { data: { category: name } }),
};

// Admin API calls
export const adminAPI = {
  getAllUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getUserIncomes: (id) => api.get(`/admin/users/${id}/incomes`),
  getUserExpenses: (id) => api.get(`/admin/users/${id}/expenses`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
};

// Manager API calls
export const managerAPI = {
  getTeamTransactions: () => api.get('/manager/team-transactions'),
  getTeamUsers: () => api.get('/manager/team-users'),
  getManagedUser: (id) => api.get(`/manager/user/${id}`),
  getManagedUserIncomes: (id) => api.get(`/manager/user/${id}/incomes`),
  getManagedUserExpenses: (id) => api.get(`/manager/user/${id}/expenses`),
  addUserUnderManager: (userData) => api.post('/manager/add-user', userData),
  updateUserPermissions: (id, permissions) => api.put(`/manager/permissions/${id}`, permissions),
  deleteManagedUser: (id) => api.delete(`/manager/user/${id}`),
};

export default api;
