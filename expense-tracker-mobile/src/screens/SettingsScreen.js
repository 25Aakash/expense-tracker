import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {
  Text,
  List,
  Switch,
  Divider,
  Surface,
  Dialog,
  Portal,
  Button,
  RadioButton,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('English');
  
  // Dialog states
  const [showCurrencyDialog, setShowCurrencyDialog] = useState(false);
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const currencies = [
    { label: 'Indian Rupee (₹)', value: 'INR' },
    { label: 'US Dollar ($)', value: 'USD' },
    { label: 'Euro (€)', value: 'EUR' },
    { label: 'British Pound (£)', value: 'GBP' },
  ];

  const languages = [
    { label: 'English', value: 'English' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'French', value: 'French' },
  ];

  const handleSaveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(`setting_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleNotificationToggle = (value) => {
    setNotifications(value);
    handleSaveSetting('notifications', value);
  };

  const handleBiometricToggle = (value) => {
    setBiometric(value);
    handleSaveSetting('biometric', value);
    if (value) {
      Alert.alert(
        'Biometric Authentication',
        'Biometric authentication will be available in the next update.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    handleSaveSetting('darkMode', value);
    Alert.alert(
      'Dark Mode',
      'Dark mode will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleCurrencyChange = (value) => {
    setCurrency(value);
    handleSaveSetting('currency', value);
    setShowCurrencyDialog(false);
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    handleSaveSetting('language', value);
    setShowLanguageDialog(false);
    if (value !== 'English') {
      Alert.alert(
        'Language',
        'Additional languages will be available in the next update.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Data export functionality will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleBackupRestore = () => {
    Alert.alert(
      'Backup & Restore',
      'Cloud backup functionality will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Feature Coming Soon',
              'Account deletion will be available in the next update. Please contact support for assistance.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
  Linking.openURL('mailto:support@dailykhata.com?subject=Support Request');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://expensetracker-pro.com/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://expensetracker-pro.com/terms');
  };

  const handleLogout = () => {
    setShowLogoutDialog(false);
    logout();
    navigation.getParent()?.replace('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Section */}
          <Surface style={styles.section} elevation={1}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                <Text style={styles.userRole}>{user?.role || 'User'}</Text>
              </View>
            </View>
          </Surface>

          {/* Preferences */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            
            <List.Item
              title="Notifications"
              description="Receive expense reminders and alerts"
              left={(props) => <List.Icon {...props} icon="bell-outline" />}
              right={() => (
                <Switch
                  value={notifications}
                  onValueChange={handleNotificationToggle}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="Biometric Authentication"
              description="Use fingerprint or face ID to unlock"
              left={(props) => <List.Icon {...props} icon="fingerprint" />}
              right={() => (
                <Switch
                  value={biometric}
                  onValueChange={handleBiometricToggle}
                />
              )}
            />
            <Divider />
            
            <List.Item
              title="Dark Mode"
              description="Switch to dark theme"
              left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={darkMode}
                  onValueChange={handleDarkModeToggle}
                />
              )}
            />
            <Divider />
            
            <TouchableOpacity onPress={() => setShowCurrencyDialog(true)}>
              <List.Item
                title="Currency"
                description={currencies.find(c => c.value === currency)?.label}
                left={(props) => <List.Icon {...props} icon="currency-usd" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
              />
            </TouchableOpacity>
            <Divider />
            
            <TouchableOpacity onPress={() => setShowLanguageDialog(true)}>
              <List.Item
                title="Language"
                description={language}
                left={(props) => <List.Icon {...props} icon="translate" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
              />
            </TouchableOpacity>
          </Surface>

          {/* Data & Privacy */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Data & Privacy</Text>
            
            <TouchableOpacity onPress={handleExportData}>
              <List.Item
                title="Export Data"
                description="Download your financial data"
                left={(props) => <List.Icon {...props} icon="download" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
              />
            </TouchableOpacity>
            <Divider />
            
            <TouchableOpacity onPress={handleBackupRestore}>
              <List.Item
                title="Backup & Restore"
                description="Sync your data to cloud"
                left={(props) => <List.Icon {...props} icon="cloud-upload-outline" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
              />
            </TouchableOpacity>
            <Divider />
            
            <TouchableOpacity onPress={handlePrivacyPolicy}>
              <List.Item
                title="Privacy Policy"
                description="How we protect your data"
                left={(props) => <List.Icon {...props} icon="shield-account-outline" />}
                right={(props) => <List.Icon {...props} icon="open-in-new" />}
              />
            </TouchableOpacity>
          </Surface>

          {/* Support */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <TouchableOpacity onPress={handleContactSupport}>
              <List.Item
                title="Contact Support"
                description="Get help with your account"
                left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
                right={(props) => <List.Icon {...props} icon="open-in-new" />}
              />
            </TouchableOpacity>
            <Divider />
            
            <TouchableOpacity onPress={() => navigation.navigate('About')}>
              <List.Item
                title="About"
                description="App information and credits"
                left={(props) => <List.Icon {...props} icon="information-outline" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
              />
            </TouchableOpacity>
            <Divider />
            
            <TouchableOpacity onPress={handleTermsOfService}>
              <List.Item
                title="Terms of Service"
                description="App usage terms and conditions"
                left={(props) => <List.Icon {...props} icon="file-document-outline" />}
                right={(props) => <List.Icon {...props} icon="open-in-new" />}
              />
            </TouchableOpacity>
          </Surface>

          {/* Account */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity onPress={() => setShowLogoutDialog(true)}>
              <List.Item
                title="Logout"
                description="Sign out of your account"
                left={(props) => <List.Icon {...props} icon="logout" />}
                titleStyle={{ color: '#ef4444' }}
              />
            </TouchableOpacity>
            <Divider />
            
            <TouchableOpacity onPress={handleDeleteAccount}>
              <List.Item
                title="Delete Account"
                description="Permanently delete your account"
                left={(props) => <List.Icon {...props} icon="delete-outline" />}
                titleStyle={{ color: '#ef4444' }}
              />
            </TouchableOpacity>
          </Surface>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>

      {/* Currency Dialog */}
      <Portal>
        <Dialog visible={showCurrencyDialog} onDismiss={() => setShowCurrencyDialog(false)}>
          <Dialog.Title>Select Currency</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={handleCurrencyChange}
              value={currency}
            >
              {currencies.map((curr) => (
                <TouchableOpacity
                  key={curr.value}
                  style={styles.radioOption}
                  onPress={() => handleCurrencyChange(curr.value)}
                >
                  <View style={styles.radioRow}>
                    <RadioButton value={curr.value} />
                    <Text style={styles.radioLabel}>{curr.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCurrencyDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Language Dialog */}
      <Portal>
        <Dialog visible={showLanguageDialog} onDismiss={() => setShowLanguageDialog(false)}>
          <Dialog.Title>Select Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={handleLanguageChange}
              value={language}
            >
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  style={styles.radioOption}
                  onPress={() => handleLanguageChange(lang.value)}
                >
                  <View style={styles.radioRow}>
                    <RadioButton value={lang.value} />
                    <Text style={styles.radioLabel}>{lang.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLanguageDialog(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Logout Confirmation Dialog */}
      <Portal>
        <Dialog visible={showLogoutDialog} onDismiss={() => setShowLogoutDialog(false)}>
          <Dialog.Title>Logout</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to logout?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button onPress={handleLogout} textColor="#ef4444">Logout</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'white',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  radioOption: {
    paddingVertical: 8,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioLabel: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SettingsScreen;
