import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
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
import { theme } from '../utils/theme';

const ResetPasswordScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestOtp = async () => {
    if (!identifier.trim()) {
      Alert.alert('Error', 'Please enter your email or mobile number');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.requestReset(identifier.trim());
      if (response.status === 200) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent to your email/mobile if account exists.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please enter OTP and new password');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.confirmReset(identifier.trim(), otp.trim(), newPassword);
      if (response.status === 200) {
        Alert.alert('Success', 'Password reset successful. You can now log in.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#3b82f6', '#ffffff']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Card style={styles.card} elevation={8}>
              <Card.Content style={styles.cardContent}>
                <Text style={styles.title}>Reset Password</Text>
                <TextInput
                  label="Email or Mobile Number"
                  value={identifier}
                  onChangeText={setIdentifier}
                  mode="outlined"
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  disabled={loading || otpSent}
                />
                {otpSent && (
                  <>
                    <TextInput
                      label="OTP"
                      value={otp}
                      onChangeText={setOtp}
                      mode="outlined"
                      keyboardType="numeric"
                      style={styles.input}
                      disabled={loading}
                    />
                    <TextInput
                      label="New Password"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      mode="outlined"
                      secureTextEntry
                      style={styles.input}
                      disabled={loading}
                    />
                  </>
                )}
                <Button
                  mode="contained"
                  onPress={otpSent ? handleResetPassword : handleRequestOtp}
                  loading={loading}
                  style={styles.button}
                >
                  {otpSent ? 'Reset Password' : 'Send OTP'}
                </Button>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
                  <Text style={styles.backText}>← Back to Login</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 20 },
  cardContent: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#3b82f6' },
  input: { marginBottom: 16 },
  button: { marginTop: 8, marginBottom: 16 },
  backText: { color: '#3b82f6', textAlign: 'center', marginTop: 8 },
});

export default ResetPasswordScreen;
