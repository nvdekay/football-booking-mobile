import { Field } from '../types/field'
import {
  AdminBooking,
  AdminBookingDetail,
  AdminMatchingFilters,
  AdminMatchingPaginatedResponse,
  AdminUser,
  BookingStatus,
  CreateFieldBody,
  CreatePricingRuleBody,
  CreateServiceBody,
  MatchingStatus,
  RevenueStats,
  Service,
  UpdateFieldBody,
  UpdateServiceBody,
} from '../types/admin'

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

// ==================== Analytics ====================

export async function getRevenueStats(
  fromDate: string,
  toDate: string,
  token: string
): Promise<ApiResponse<RevenueStats>> {
  return request<RevenueStats>(
    `/admin/stats/revenue?from_date=${fromDate}&to_date=${toDate}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
}

// ==================== Fields ====================

export async function createField(
  body: CreateFieldBody,
  token: string
): Promise<ApiResponse<Field>> {
  return request<Field>('/admin/fields', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export async function updateField(
  fieldId: number,
  body: UpdateFieldBody,
  token: string
): Promise<ApiResponse<Field>> {
  return request<Field>(`/admin/fields/${fieldId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export async function deleteField(
  fieldId: number,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/admin/fields/${fieldId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ==================== Pricing Rules ====================

export async function createPricingRule(
  fieldId: number,
  body: CreatePricingRuleBody,
  token: string
): Promise<ApiResponse<any>> {
  return request<any>(`/fields/${fieldId}/pricing-rules`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

// ==================== Services ====================

export async function getServices(): Promise<ApiResponse<Service[]>> {
  return request<Service[]>('/services')
}

export async function getServicesAdmin(token: string): Promise<ApiResponse<Service[]>> {
  return request<Service[]>('/services/all', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createService(
  body: CreateServiceBody,
  token: string
): Promise<ApiResponse<Service>> {
  return request<Service>('/services', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export async function updateService(
  serviceId: number,
  body: UpdateServiceBody,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/services/${serviceId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export async function deleteService(
  serviceId: number,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/services/${serviceId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ==================== Bookings (Admin Management) ====================

export async function getAllBookingsAdmin(
  token: string
): Promise<ApiResponse<AdminBooking[]>> {
  return request<AdminBooking[]>('/bookings/admin/all', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getBookingDetailAdmin(
  bookingId: number,
  token: string
): Promise<ApiResponse<AdminBookingDetail>> {
  return request<AdminBookingDetail>(`/bookings/admin/${bookingId}/detail`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function adminUpdateBookingStatus(
  bookingId: number,
  status: BookingStatus,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/bookings/admin/${bookingId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
}

export async function adminRefundBooking(
  bookingId: number,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/bookings/admin/${bookingId}/refund`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ==================== Bookings (Check-in) ====================

export async function getConfirmedBookings(
  token: string
): Promise<ApiResponse<AdminBooking[]>> {
  return request<AdminBooking[]>('/bookings/admin/confirmed', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function processCheckIn(
  checkInCode: string,
  token: string
): Promise<ApiResponse<AdminBooking>> {
  return request<AdminBooking>('/bookings/admin/check-in', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ check_in_code: checkInCode }),
  })
}

// ==================== Users ====================

export async function getUsers(token: string): Promise<ApiResponse<AdminUser[]>> {
  return request<AdminUser[]>('/admin/users', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getUserById(
  userId: number,
  token: string
): Promise<ApiResponse<AdminUser>> {
  return request<AdminUser>(`/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function updateUserRole(
  userId: number,
  role: string,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role }),
  })
}

// ==================== Team Matchings (Admin Management) ====================

export async function getAllMatchingsAdmin(
  filters: AdminMatchingFilters,
  token: string
): Promise<ApiResponse<AdminMatchingPaginatedResponse>> {
  const searchParams = new URLSearchParams()
  if (filters.status) searchParams.append('status', filters.status)
  if (filters.date) searchParams.append('date', filters.date)
  if (filters.level) searchParams.append('level', filters.level)
  if (filters.field_id) searchParams.append('field_id', filters.field_id.toString())
  if (filters.page) searchParams.append('page', filters.page.toString())
  if (filters.limit) searchParams.append('limit', filters.limit.toString())

  const query = searchParams.toString()
  return request<AdminMatchingPaginatedResponse>(
    `/team-matchings/admin/all${query ? `?${query}` : ''}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
}

export async function getMatchingStatisticsAdmin(
  token: string
): Promise<ApiResponse<any>> {
  return request<any>('/team-matchings/admin/statistics', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function adminUpdateMatchingStatus(
  matchingId: number,
  status: MatchingStatus,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/team-matchings/admin/${matchingId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  })
}

export async function adminDeleteMatching(
  matchingId: number,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/team-matchings/admin/${matchingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}
