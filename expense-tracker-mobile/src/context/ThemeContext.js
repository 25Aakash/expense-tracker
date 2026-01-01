import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const lightTheme = {
  background: '#ffffff',
  surface: '#f5f5f5',
  primary: '#4CAF50',
  secondary: '#2196F3',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e0e0e0',
  card: '#ffffff',
  error: '#f44336',
  success: '#4CAF50',
  warning: '#ff9800',
  shadow: '#000000',
  tabBar: '#ffffff',
  tabBarInactive: '#999999',
  inputBackground: '#f5f5f5',
  gradientStart: '#4CAF50',
  gradientEnd: '#2196F3',
};

export const darkTheme = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#4CAF50',
  secondary: '#2196F3',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#2D2D2D',
  card: '#242424',
  error: '#CF6679',
  success: '#4CAF50',
  warning: '#ff9800',
  shadow: '#000000',
  tabBar: '#1E1E1E',
  tabBarInactive: '#666666',
  inputBackground: '#1E1E1E',
  gradientStart: '#4CAF50',
  gradientEnd: '#2196F3',
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
