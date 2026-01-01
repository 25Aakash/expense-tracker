import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';

const AuthLoadingScreen = ({ navigation }) => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    checkAuthAndNavigate();
  }, [loading, isAuthenticated]);

  const checkAuthAndNavigate = async () => {
    try {
      // Wait for auth context to finish loading
      if (loading) return;

      // Check if user has completed onboarding
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      if (!hasSeenOnboarding) {
        navigation.replace('Onboarding');
        return;
      }

      // Check if user is authenticated
      if (!isAuthenticated) {
        navigation.replace('Login');
        return;
      }

      // Navigate to main screen
      navigation.replace('Main');
    } catch (error) {
      console.error('Error in auth loading:', error);
      navigation.replace('Login');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.text, { color: theme.textSecondary }]}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default AuthLoadingScreen;
