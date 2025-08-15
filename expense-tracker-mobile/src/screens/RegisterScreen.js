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
    <View style={styles.container}>
      <LinearGradient
        colors={['#3b82f6', '#ffffff']}
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
                <View style={styles.logoCircle}>
                  <Ionicons name="wallet" size={40} color="#3b82f6" />
                </View>
                <Text style={styles.appName}>Expense Tracker</Text>
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>
                  Join us to start tracking your expenses
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
                <Card style={styles.card}>
                  <Card.Content style={styles.cardContent}>
                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="person-outline" 
                        size={20} 
                        color="#3b82f6" 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(value) => handleInputChange('name', value)}
                        mode="outlined"
                        autoCapitalize="words"
                        style={styles.input}
                        disabled={loading}
                      />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="mail-outline" 
                        size={20} 
                        color="#3b82f6" 
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
                        style={styles.input}
                        disabled={loading}
                      />
                    </View>

                    {/* Mobile Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="call-outline" 
                        size={20} 
                        color="#3b82f6" 
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
                        style={styles.input}
                        disabled={loading}
                      />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={20} 
                        color="#3b82f6" 
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
                          />
                        }
                        style={styles.input}
                        disabled={loading}
                      />
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={20} 
                        color="#3b82f6" 
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
                          />
                        }
                        style={styles.input}
                        disabled={loading}
                      />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                      onPress={handleRegister}
                      disabled={loading}
                      style={styles.registerButton}
                    >
                      <LinearGradient
                        colors={['#3b82f6', '#1d4ed8']}
                        style={styles.registerButton}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons 
                              name="person-add-outline" 
                              size={20} 
                              color="white" 
                              style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>Create Account</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                      <Text style={styles.loginText}>Already have an account? </Text>
                      <TouchableOpacity
                        onPress={navigateToLogin}
                        disabled={loading}
                      >
                        <Text style={styles.loginLink}>Sign In</Text>
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
  registerButton: {
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default RegisterScreen;
