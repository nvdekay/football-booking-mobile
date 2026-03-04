import {
  Booking,
  CreateBookingBody,
  CreateBookingResponse,
  InitiatePaymentBody,
  InitiatePaymentResponse,
  Service,
} from '../types/booking'

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

  const response = await fetch(url, { ...options, headers })
  const data = await response.json()

  if (!response.ok || (data && data.success === false)) {
    throw new Error(data?.message || 'Something went wrong')
  }

  return data
}

export async function getServices(): Promise<ApiResponse<Service[]>> {
  return request<Service[]>('/services')
}

export async function createBooking(body: CreateBookingBody, token: string): Promise<ApiResponse<CreateBookingResponse>> {
  return request<CreateBookingResponse>('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export async function initiatePayment(body: InitiatePaymentBody, token: string): Promise<ApiResponse<InitiatePaymentResponse>> {
  return request<InitiatePaymentResponse>('/payments/initiate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export async function getMyBookings(token: string): Promise<ApiResponse<Booking[]>> {
  return request<Booking[]>('/bookings/my-bookings', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getBookingQr(
  bookingId: number,
  token: string
): Promise<ApiResponse<{ check_in_code: string }>> {
  return request<{ check_in_code: string }>(`/bookings/${bookingId}/qr`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function cancelBooking(
  bookingId: number,
  reason: string,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  })
}
