import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  List,
  Button,
  Divider,
  Surface,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppUpdateService from '../services/AppUpdateService';
import { theme } from '../utils/theme';

const AboutScreen = ({ navigation }) => {
  const appInfo = AppUpdateService.getAppInfo();

  const openURL = (url) => {
    Linking.openURL(url);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:dailycashbook3@gmail.com?subject=Support Request');
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/your-app-id',
      android: 'https://play.google.com/store/apps/details?id=com.expensetracker.pro'
    });
    Linking.openURL(storeUrl);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* App Info Section */}
          <Surface style={styles.section} elevation={1}>
            <View style={styles.appInfoHeader}>
              <View style={styles.appIcon}>
                <Ionicons name="calculator" size={40} color="#6366f1" />
              </View>
              <View style={styles.appDetails}>
                <Text style={styles.appName}>DailyCashBook</Text>
                <Text style={styles.appVersion}>Version {appInfo.version}</Text>
                <Text style={styles.buildNumber}>Build {appInfo.buildNumber}</Text>
              </View>
            </View>
            <Text style={styles.appDescription}>
              Your comprehensive financial management companion for tracking expenses, managing income, and gaining insights into your financial habits.
            </Text>
          </Surface>

          {/* Quick Actions */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            
            <TouchableOpacity style={styles.actionItem} onPress={handleRateApp}>
              <View style={styles.actionLeft}>
                <Ionicons name="star" size={20} color="#f59e0b" />
                <Text style={styles.actionText}>Rate This App</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleContactSupport}>
              <View style={styles.actionLeft}>
                <Ionicons name="mail" size={20} color="#6366f1" />
                <Text style={styles.actionText}>Contact Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => openURL('https://github.com/25Aakash/dailycashbook/blob/main/HELP_CENTER.md')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="help-circle" size={20} color="#10b981" />
                <Text style={styles.actionText}>Help Center</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Surface>

          {/* Features */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Key Features</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="analytics" size={20} color="#6366f1" />
                <Text style={styles.featureText}>Comprehensive Analytics</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="people" size={20} color="#10b981" />
                <Text style={styles.featureText}>Team Collaboration</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="shield-checkmark" size={20} color="#f59e0b" />
                <Text style={styles.featureText}>Secure Data Protection</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="cloud-upload" size={20} color="#8b5cf6" />
                <Text style={styles.featureText}>Cloud Synchronization</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="camera" size={20} color="#ef4444" />
                <Text style={styles.featureText}>Receipt Scanning</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="globe" size={20} color="#06b6d4" />
                <Text style={styles.featureText}>Multi-language Support</Text>
              </View>
            </View>
          </Surface>

          {/* Legal */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Legal</Text>
            
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => openURL('https://github.com/25Aakash/dailycashbook/blob/main/PRIVACY_POLICY.md')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="document-text" size={20} color="#6b7280" />
                <Text style={styles.actionText}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => openURL('https://github.com/25Aakash/dailycashbook/blob/main/TERMS_OF_SERVICE.md')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="document-text" size={20} color="#6b7280" />
                <Text style={styles.actionText}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={() => openURL('https://github.com/25Aakash/dailycashbook/blob/main/LICENSES.md')}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="code" size={20} color="#6b7280" />
                <Text style={styles.actionText}>Open Source Licenses</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Surface>

          {/* Developer Info */}
          <Surface style={styles.section} elevation={1}>
            <Text style={styles.sectionTitle}>Developer</Text>
            <Text style={styles.developerText}>
              DailyCashBook Team
            </Text>
            <Text style={styles.contactText}>
              dailycashbook3@gmail.com
            </Text>
          </Surface>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
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
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  
  // App Info
  appInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appDetails: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  appVersion: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  buildNumber: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 1,
  },
  appDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  
  // Actions
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  
  // Features
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  
  // Developer
  developerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6366f1',
  },
  
  bottomPadding: {
    height: 20,
  },
});

export default AboutScreen;
