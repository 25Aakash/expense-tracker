import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme, isDarkMode } from '../utils/theme';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, loading } = useAuth();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { name, email, mobile, password, confirmPassword } = formData;

    if (!name.trim() || !email.trim() || !mobile.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const { name, email, mobile, password } = formData;
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      password,
    });

    if (result.success) {
      Alert.alert(
        'OTP Sent',
        result.message || 'Please check your email for OTP verification.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('OTPVerification', { email: email.trim() });
            },
          },
        ]
      );
    } else {
      Alert.alert('Registration Failed', result.message);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <LinearGradient
        colors={isDarkMode ? [theme.surface, theme.background] : [theme.primary, '#ffffff']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Animated Logo Section */}
              <Animated.View 
                style={[
                  styles.logoContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={[theme.primary, theme.secondary, theme.primary]}
                  style={styles.logoCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="wallet" size={48} color="white" />
                </LinearGradient>
                <Text style={[styles.appName, { color: theme.text }]}>ExpenseTracker</Text>
                <Text style={[styles.tagline, { color: theme.textSecondary }]}>Smart Expense Management</Text>
              </Animated.View>

              {/* Animated Header */}
              <Animated.View 
                style={[
                  styles.header,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <Text style={[styles.title, { color: theme.text }]}>Create Your Account</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Start your financial journey with us today
                </Text>
              </Animated.View>

              {/* Animated Form Card */}
              <Animated.View
                style={[
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
                  }
                ]}
              >
                <Card style={[styles.card, { backgroundColor: theme.card }]}>
                  <Card.Content style={styles.cardContent}>
                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="person-outline" 
                        size={22} 
                        color={theme.primary} 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(value) => handleInputChange('name', value)}
                        mode="outlined"
                        autoCapitalize="words"
                        style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
                        disabled={loading}
                        textColor={theme.text}
                        theme={{
                          colors: {
                            primary: theme.primary,
                            outline: isDarkMode ? theme.border : '#d1d5db',
                            background: theme.card,
                          }
                        }}
                      />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="mail-outline" 
                        size={22} 
                        color={theme.primary} 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        label="Email"
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        mode="outlined"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
                        disabled={loading}
                        textColor={theme.text}
                        theme={{
                          colors: {
                            primary: theme.primary,
                            outline: isDarkMode ? theme.border : '#d1d5db',
                            background: theme.card,
                          }
                        }}
                      />
                    </View>

                    {/* Mobile Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="call-outline" 
                        size={22} 
                        color={theme.primary} 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        label="Mobile Number"
                        value={formData.mobile}
                        onChangeText={(value) => handleInputChange('mobile', value)}
                        mode="outlined"
                        keyboardType="phone-pad"
                        placeholder="1234567890"
                        maxLength={10}
                        style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
                        disabled={loading}
                        textColor={theme.text}
                        theme={{
                          colors: {
                            primary: theme.primary,
                            outline: isDarkMode ? theme.border : '#d1d5db',
                            background: theme.card,
                          }
                        }}
                      />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={22} 
                        color={theme.primary} 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        label="Password"
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
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
                            outline: isDarkMode ? theme.border : '#d1d5db',
                            background: theme.card,
                          }
                        }}
                      />
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={22} 
                        color={theme.primary} 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChangeText={(value) => handleInputChange('confirmPassword', value)}
                        mode="outlined"
                        secureTextEntry={!showConfirmPassword}
                        right={
                          <TextInput.Icon
                            icon={showConfirmPassword ? 'eye-off' : 'eye'}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            iconColor={theme.primary}
                          />
                        }
                        style={[styles.input, { color: theme.text, backgroundColor: theme.card }]}
                        disabled={loading}
                        textColor={theme.text}
                        theme={{
                          colors: {
                            primary: theme.primary,
                            outline: isDarkMode ? theme.border : '#d1d5db',
                            background: theme.card,
                          }
                        }}
                      />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                      onPress={handleRegister}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={isDarkMode ? [theme.primary, theme.secondary] : ['#3b82f6', '#1d4ed8', '#1e40af']}
                        style={styles.registerButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        {loading ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator color="white" size="small" />
                            <Text style={[styles.buttonText, { marginLeft: 8 }]}>Creating Account...</Text>
                          </View>
                        ) : (
                          <View style={styles.buttonContent}>
                            <Ionicons 
                              name="rocket-outline" 
                              size={22} 
                              color="white" 
                              style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>Get Started</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                      <Text style={[styles.loginText, { color: theme.textSecondary }]}>Already have an account? </Text>
                      <TouchableOpacity
                        onPress={navigateToLogin}
                        disabled={loading}
                      >
                        <Text style={[styles.loginLink, { color: theme.primary }]}>Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </Card.Content>
                </Card>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
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
    marginBottom: 36,
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardContent: {
    padding: 28,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 18,
  },
  inputIcon: {
    position: 'absolute',
    top: 30,
    left: 14,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
    paddingLeft: 45,
    fontSize: 16,
  },
  registerButton: {
    borderRadius: 30,
    paddingVertical: 4,
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  loginText: {
    fontSize: 15,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 15,
    color: '#667eea',
    fontWeight: '700',
  },
});

export default RegisterScreen;
