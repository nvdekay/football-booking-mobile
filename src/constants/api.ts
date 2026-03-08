const DEV_HOST = '172.20.10.2'

// LAN IP works for all: iOS Simulator, Android Emulator, and physical devices
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || `http://${DEV_HOST}:3000/api/v1`

// Socket URL (without /api/v1 path)
export const SOCKET_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || `http://${DEV_HOST}:3000`).replace('/api/v1', '')
