import { Platform } from 'react-native';

class AnalyticsService {
  static isInitialized = false;

  static init() {
    if (this.isInitialized) return;
    
    // Initialize your analytics service here
    // For production, you might use:
    // - Firebase Analytics
    // - Mixpanel
    // - Amplitude
    // - Custom analytics solution
    
    console.log('Analytics service initialized');
    this.isInitialized = true;
  }

  static trackEvent(eventName, properties = {}) {
    if (!this.isInitialized) return;
    
    const eventData = {
      event: eventName,
      properties: {
        ...properties,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      }
    };

    // In production, send to your analytics service
    console.log('Analytics Event:', eventData);
  }

  static trackScreen(screenName, properties = {}) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties
    });
  }

  static trackError(error, context = {}) {
    const errorData = {
      error: error.toString(),
      stack: error.stack,
      context,
      platform: Platform.OS,
      timestamp: new Date().toISOString(),
    };

    // In production, send to crash reporting service
    console.error('Error tracked:', errorData);
  }

  static trackUserAction(action, details = {}) {
    this.trackEvent('user_action', {
      action,
      ...details
    });
  }

  static setUserProperties(properties) {
    if (!this.isInitialized) return;
    
    // Set user properties in analytics service
    console.log('User properties set:', properties);
  }

  static trackAppLaunch() {
    this.trackEvent('app_launch', {
      app_version: require('../../package.json').version,
    });
  }

  static trackAppBackground() {
    this.trackEvent('app_background');
  }

  static trackAppForeground() {
    this.trackEvent('app_foreground');
  }
}

export default AnalyticsService;
