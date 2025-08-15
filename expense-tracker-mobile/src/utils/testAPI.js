// Test API connectivity
import { authAPI } from '../services/api';

export const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test a simple endpoint first
    const response = await fetch('http://192.168.1.33:5000/health');
    const healthData = await response.text();
    console.log('Health check response:', healthData);
    
    return { success: true, message: 'API is reachable' };
  } catch (error) {
    console.error('API test error:', error);
    return { success: false, message: error.message };
  }
};
