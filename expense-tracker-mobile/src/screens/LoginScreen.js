import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Checkbox,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { theme, isDarkMode } from '../utils/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, loading } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // Load saved credentials
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedRemember = await AsyncStorage.getItem('rememberMe');
      const savedEmail = await AsyncStorage.getItem('savedEmail');
      
      if (savedRemember === 'true' && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Save or remove credentials based on remember me
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true');
        await AsyncStorage.setItem('savedEmail', email.trim());
      } else {
        await AsyncStorage.removeItem('rememberMe');
        await AsyncStorage.removeItem('savedEmail');
      }
    } catch (error) {
      console.log('Error saving credentials:', error);
    }

    const result = await login(email.trim(), password);
    
    if (result.success) {
      navigation.replace('Main');
    } else {
      Alert.alert('Login Failed', result.message);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <LinearGradient
      colors={isDarkMode ? [theme.surface, theme.background] : ['#3b82f6', '#ffffff']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Logo/Icon Section */}
            <Animated.View 
              style={[
                styles.logoContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                }
              ]}
            >
              <View style={[styles.logoCircle, { backgroundColor: isDarkMode ? theme.card : '#ffffff' }]}>
                <Ionicons name="wallet" size={48} color={theme.primary} />
              </View>
              <Text style={[styles.appName, { color: theme.text }]}>ExpenseTracker</Text>
            </Animated.View>

            {/* Header */}
            <Animated.View 
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                }
              ]}
            >
              <Title style={[styles.title, { color: theme.text }]}>Welcome Back!</Title>
              <Paragraph style={[styles.subtitle, { color: theme.textSecondary }]}>
                Sign in to your expense tracker account
              </Paragraph>
            </Animated.View>

            {/* Login Form */}
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                }
              ]}
            >
              <Card style={[styles.card, { backgroundColor: theme.card }]} elevation={8}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={theme.primary} style={styles.inputIcon} />
                    <TextInput
                      label="Email or Mobile Number"
                      value={email}
                      onChangeText={setEmail}
                      mode="outlined"
                      keyboardType="default"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
                      disabled={loading}
                      textColor={theme.text}
                      theme={{
                        colors: {
                          primary: theme.primary,
                          outline: isDarkMode ? theme.border : '#e5e7eb',
                          background: theme.card,
                        }
                      }}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={20} color={theme.primary} style={styles.inputIcon} />
                    <TextInput
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowPassword(!showPassword)}
                          iconColor={theme.primary}
                        />
                      }
                      style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
                      disabled={loading}
                      textColor={theme.text}
                      theme={{
                        colors: {
                          primary: theme.primary,
                          outline: isDarkMode ? theme.border : '#e5e7eb',
                          background: theme.card,
                        }
                      }}
                    />
                  </View>

                  {/* Remember Me Checkbox */}
                  <View style={styles.rememberMeContainer}>
                    <Checkbox
                      status={rememberMe ? 'checked' : 'unchecked'}
                      onPress={() => setRememberMe(!rememberMe)}
                      color={theme.primary}
                      disabled={loading}
                    />
                    <TouchableOpacity 
                      onPress={() => setRememberMe(!rememberMe)}
                      disabled={loading}
                      style={styles.rememberMeTextContainer}
                    >
                      <Text style={[styles.rememberMeText, { color: theme.text }]}>Remember me</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ResetPassword')}
                    disabled={loading}
                    style={{ alignSelf: 'flex-end', marginBottom: 8 }}
                  >
                    <Text style={{ color: theme.primary, fontWeight: '600' }}>Forgot Password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleLogin} disabled={loading}>
                    <LinearGradient
                      colors={isDarkMode ? [theme.primary, theme.secondary] : ['#3b82f6', '#1d4ed8']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loginButton}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Ionicons name="log-in-outline" size={20} color="white" style={styles.buttonIcon} />
                          <Text style={styles.buttonText}>Sign In</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.registerContainer}>
                    <Text style={[styles.registerText, { color: theme.textSecondary }]}>Don't have an account? </Text>
                    <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
                      <Text style={[styles.registerLink, { color: theme.primary }]}>Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    padding: 24,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  inputIcon: {
    position: 'absolute',
    top: 28,
    left: 12,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'white',
    paddingLeft: 40,
  },
  loginButton: {
    borderRadius: 25,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6b7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rememberMeTextContainer: {
    marginLeft: 8,
  },
  rememberMeText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default LoginScreen;
