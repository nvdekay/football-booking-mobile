// const PROD_URL = 'https://football-booking-api-rp2s.onrender.com'
const PROD_URL = 'http://localhost:3000'


export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || `${PROD_URL}/api/v1`

// Socket URL (without /api/v1 path)
export const SOCKET_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || PROD_URL).replace('/api/v1', '')