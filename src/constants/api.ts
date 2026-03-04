import { Platform } from 'react-native'

const ENV_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'

// Android emulator uses 10.0.2.2 to access host machine's localhost
export const API_BASE_URL =
  Platform.OS === 'android' ? ENV_URL.replace('localhost', '10.0.2.2') : ENV_URL

// Socket URL (without /api/v1 path)
export const SOCKET_URL =
  Platform.OS === 'android'
    ? (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000').replace('/api/v1', '').replace('localhost', '10.0.2.2')
    : (process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000').replace('/api/v1', '')
