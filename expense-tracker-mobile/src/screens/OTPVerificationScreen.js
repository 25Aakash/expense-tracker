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
  ActivityIndicator,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../services/api';

const OTPVerificationScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // Get email from route params
  const { email } = route.params || {};

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

    // Start countdown timer
    startCountdown();
  }, []);

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(30);
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      Alert.alert('Error', 'OTP must be 6 digits');
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.verifyOtp(email, otp);
      
      console.log('OTP verification response:', response.data);
      
      // Backend returns { message: 'Registration complete' } on success
      if (response.status === 200 && response.data.message) {
        Alert.alert(
          'Success!',
          'Your account has been verified successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle different error cases
      if (error.response?.status === 400) {
        Alert.alert('Error', error.response.data.error || 'Invalid OTP');
      } else if (error.response?.status === 429) {
        Alert.alert('Error', 'Too many incorrect attempts. Please register again.');
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.error || error.response?.data?.message || 'OTP verification failed'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResendLoading(true);
      const response = await authAPI.resendOtp(email);
      
      console.log('Resend OTP response:', response.data);
      
      // Backend returns { message: 'New OTP sent' } on success
      if (response.status === 200 && response.data.message) {
        Alert.alert('Success', response.data.message || 'OTP has been resent to your email');
        startCountdown();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.error || error.response?.data?.message || 'Failed to resend OTP'
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
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
                  <Ionicons name="mail" size={40} color="#3b82f6" />
                </View>
                <Text style={styles.appName}>Verify Your Email</Text>
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
                <Text style={styles.title}>Enter OTP</Text>
                <Text style={styles.subtitle}>
                  We've sent a 6-digit code to{'\n'}
                  <Text style={styles.emailText}>{email}</Text>
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
                    {/* OTP Input */}
                    <View style={styles.inputContainer}>
                      <Ionicons 
                        name="keypad-outline" 
                        size={20} 
                        color="#3b82f6" 
                        style={styles.inputIcon}
                      />
                      <TextInput
                        label="6-Digit OTP"
                        value={otp}
                        onChangeText={setOtp}
                        mode="outlined"
                        keyboardType="numeric"
                        maxLength={6}
                        style={styles.input}
                        disabled={loading}
                        theme={{
                          colors: {
                            primary: '#3b82f6',
                            outline: '#e5e7eb',
                          }
                        }}
                      />
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                      onPress={handleVerifyOTP}
                      disabled={loading}
                      style={styles.verifyButton}
                    >
                      <LinearGradient
                        colors={['#3b82f6', '#1d4ed8']}
                        style={styles.verifyButton}
                      >
                        {loading ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons 
                              name="checkmark-circle-outline" 
                              size={20} 
                              color="white" 
                              style={styles.buttonIcon}
                            />
                            <Text style={styles.buttonText}>Verify OTP</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Resend OTP Section */}
                    <View style={styles.resendContainer}>
                      <Text style={styles.resendText}>Didn't receive the code?</Text>
                      
                      {canResend ? (
                        <TouchableOpacity
                          onPress={handleResendOTP}
                          disabled={resendLoading}
                        >
                          <Text style={styles.resendLink}>
                            {resendLoading ? 'Sending...' : 'Resend OTP'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.countdownText}>
                          Resend in {countdown}s
                        </Text>
                      )}
                    </View>

                    {/* Back to Login */}
                    <View style={styles.backContainer}>
                      <TouchableOpacity
                        onPress={handleBackToLogin}
                        disabled={loading}
                      >
                        <Text style={styles.backText}>
                          ← Back to Login
                        </Text>
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
    lineHeight: 24,
  },
  emailText: {
    fontWeight: 'bold',
    color: 'white',
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
    textAlign: 'center',
    fontSize: 18,
    letterSpacing: 2,
  },
  verifyButton: {
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
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  resendLink: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  countdownText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  backContainer: {
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default OTPVerificationScreen;
