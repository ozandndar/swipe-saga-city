import { Platform } from 'react-native';

export const ENV = {
  dev: {
    apiUrl: 'http://localhost:3000',
    environment: 'development',
  },
  staging: {
    apiUrl: 'https://staging-api.example.com',
    environment: 'staging',
  },
  prod: {
    apiUrl: 'https://api.example.com',
    environment: 'production',
  },
};

export const getEnvironment = () => {
  if (__DEV__) {
    if (Platform.OS === 'web') {
      return ENV.dev;
    }
    return ENV.dev;
  }
  return ENV.prod;
};

export const environment = getEnvironment(); 