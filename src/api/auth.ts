import { AuthResponse, LoginBody, LoginResponseData, RegisterBody, UpdateProfileBody, User } from '../types/auth'

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<AuthResponse<T>> {
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

export async function register(body: RegisterBody) {
  return request<null>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function verifyEmail(email: string, code: string) {
  const params = new URLSearchParams({ email, code })
  return request<null>(`/auth/email-verification/verify?${params.toString()}`, {
    method: 'GET',
  })
}

export async function resendVerification(email: string) {
  return request<null>('/auth/email-verification/resend', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function login(body: LoginBody) {
  return request<LoginResponseData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getMe(token: string) {
  return request<User>('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function updateProfile(token: string, body: UpdateProfileBody) {
  return request<User>('/auth/me', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })
}
