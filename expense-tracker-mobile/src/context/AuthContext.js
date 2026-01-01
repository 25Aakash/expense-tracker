import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync('token');
      const storedUser = await SecureStore.getItemAsync('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email }); // Debug log
      
      const response = await authAPI.login(email, password);
      console.log('Login response:', response.data); // Debug log
      
      // Backend returns { token, user, permissions } directly on success
      if (response.data.token && response.data.user) {
        const { token: authToken, user: userData, permissions } = response.data;
        const mergedUser = permissions ? { ...userData, permissions } : userData;
        // Store in SecureStore
        await SecureStore.setItemAsync('token', authToken);
        await SecureStore.setItemAsync('user', JSON.stringify(mergedUser));
        // Update state
        setToken(authToken);
        setUser(mergedUser);
        return { success: true };
      } else {
        return { success: false, message: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error details:', error.response?.data); // Enhanced debug log
      console.error('Login error status:', error.response?.status); // Status code
      console.error('Login error message:', error.message); // Error message
      
      return { 
        success: false, 
        message: error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // Add mobile field as required by backend (you can make this configurable)
      const registrationData = {
        ...userData,
        mobile: userData.mobile || '1234567890', // Default mobile for now
      };
      
      const response = await authAPI.registerRequest(registrationData);
      console.log('Registration response:', response.data); // Debug log
      
      // Backend returns { message: 'OTP sent to email' } on success
      if (response.status === 200 && response.data.message) {
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message || response.data.error };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        message: error.response?.data?.error || error.response?.data?.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear SecureStore
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
      
      // Clear state
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };


  // Fetch latest user info and permissions from backend
  const refreshUser = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();
      if (response.data) {
        // If permissions is a separate field, merge it into user
        const { user, permissions } = response.data;
        let mergedUser;
        if (user && permissions) {
          mergedUser = { ...user, permissions };
        } else if (user) {
          mergedUser = user;
        } else {
          mergedUser = response.data;
        }
        setUser(mergedUser);
        await SecureStore.setItemAsync('user', JSON.stringify(mergedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
