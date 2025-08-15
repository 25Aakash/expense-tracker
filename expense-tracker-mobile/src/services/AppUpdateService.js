import { Alert, Linking, Platform } from 'react-native';
import * as Application from 'expo-application';

class AppUpdateService {
  static async checkForUpdates() {
    try {
      const currentVersion = Application.nativeApplicationVersion;
      
      // This would typically call your backend API to check for updates
      // For now, we'll implement a basic version check
      const latestVersion = await this.getLatestVersion();
      
      if (this.isUpdateAvailable(currentVersion, latestVersion)) {
        this.showUpdateAlert(latestVersion);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  static async getLatestVersion() {
    // In a real app, this would call your API
    // For demo purposes, return current version
    return Application.nativeApplicationVersion;
  }

  static isUpdateAvailable(current, latest) {
    // Simple version comparison
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;
      
      if (latestPart > currentPart) return true;
      if (latestPart < currentPart) return false;
    }
    
    return false;
  }

  static showUpdateAlert(newVersion) {
    Alert.alert(
      'Update Available',
      `A new version (${newVersion}) is available. Update now for the latest features and improvements.`,
      [
        { text: 'Later', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => this.openStore(),
          style: 'default'
        }
      ]
    );
  }

  static openStore() {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/your-app-id',
      android: 'https://play.google.com/store/apps/details?id=com.expensetracker.pro'
    });
    
    Linking.openURL(storeUrl);
  }

  static getAppInfo() {
    return {
      version: Application.nativeApplicationVersion,
      buildNumber: Application.nativeBuildVersion,
      bundleId: Application.applicationId,
      name: Application.applicationName,
    };
  }
}

export default AppUpdateService;
