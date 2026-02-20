import { TopupBody, TopupResponse, WalletTransaction } from '../types/wallet'

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'

type ApiResponse<T = any> = {
  success: boolean
  message: string
  data: T
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const response = await fetch(url, { ...options, headers })
  const data = await response.json()

  if (!response.ok || (data && data.success === false)) {
    throw new Error(data?.message || 'Something went wrong')
  }

  return data
}

export async function topupWallet(body: TopupBody, token: string): Promise<ApiResponse<TopupResponse>> {
  return request<TopupResponse>('/wallet/topup', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export async function getWalletHistory(token: string): Promise<ApiResponse<WalletTransaction[]>> {
  return request<WalletTransaction[]>('/wallet/history', {
    headers: { Authorization: `Bearer ${token}` },
  })
}
