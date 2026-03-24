import { Platform } from 'react-native';
import Constants from 'expo-constants';

// On web: empty string → requests go to Metro proxy at /api/*
// On native: direct Render URL
const BASE_URL =
  Platform.OS === 'web'
    ? ''
    : Constants.expoConfig?.extra?.apiUrl || 'https://endurace-backend.onrender.com';

export default BASE_URL;