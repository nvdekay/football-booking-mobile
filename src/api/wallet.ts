import { TopupBody, TopupResponse, WalletTransaction } from '../types/wallet'
import { API_BASE_URL } from '../constants/api'

const BASE_URL = API_BASE_URL

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

  let response: Response
  try {
    response = await fetch(url, { ...options, headers })
  } catch (err: any) {
    throw new Error(err?.message === 'Network request failed'
      ? 'Không có kết nối mạng. Vui lòng kiểm tra lại.'
      : 'Lỗi kết nối đến máy chủ')
  }

  let data: any
  try {
    data = await response.json()
  } catch {
    throw new Error('Phản hồi không hợp lệ từ máy chủ')
  }

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
  const result = await request<WalletTransaction[]>('/wallet/history', {
    headers: { Authorization: `Bearer ${token}` },
  })

  // Ensure data is always an array
  if (!Array.isArray(result?.data)) {
    result.data = []
  }

  return result
}
