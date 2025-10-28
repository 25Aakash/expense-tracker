import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
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
  surface: '#1e1e1e',
  primary: '#66BB6A',
  secondary: '#42A5F5',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#333333',
  card: '#1e1e1e',
  error: '#ef5350',
  success: '#66BB6A',
  warning: '#ffa726',
  shadow: '#000000',
  tabBar: '#1e1e1e',
  tabBarInactive: '#666666',
  inputBackground: '#2a2a2a',
  gradientStart: '#66BB6A',
  gradientEnd: '#42A5F5',
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'true');
      } else {
        // Default to system preference
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newValue = !isDarkMode;
      setIsDarkMode(newValue);
      await AsyncStorage.setItem('darkMode', newValue.toString());
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

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
