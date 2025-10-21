// IMPORTANT: Keep these side‑effect imports first for proper initialization
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Import screens and navigation
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import OnboardingScreen from './src/screens/OnboardingScreenWorking';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import AddIncomeScreen from './src/screens/AddIncomeScreen';

// Import context providers and components
import { AuthProvider } from './src/context/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';

const Stack = createNativeStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366f1',
    primaryContainer: '#e0e7ff',
    secondary: '#7c3aed',
    background: '#ffffff',
    surface: '#f8fafc',
    error: '#ef4444',
    onPrimary: '#ffffff',
    onBackground: '#1f2937',
    onSurface: '#374151',
  },
};

export default function App() {
  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator 
              initialRouteName="Onboarding"
              screenOptions={{
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.onPrimary,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="Onboarding" 
                component={OnboardingScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Login" 
                component={LoginScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Register" 
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="OTPVerification" 
                component={OTPVerificationScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Main" 
                component={MainTabNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="AddExpense" 
                component={AddExpenseScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="AddIncome" 
                component={AddIncomeScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="ResetPassword" 
                component={ResetPasswordScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}
