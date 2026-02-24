import { Field } from '../types/field'
import {
  AdminUser,
  CreateFieldBody,
  CreatePricingRuleBody,
  CreateServiceBody,
  RevenueStats,
  Service,
  UpdateFieldBody,
} from '../types/admin'

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

export async function deleteService(
  serviceId: number,
  token: string
): Promise<ApiResponse<null>> {
  return request<null>(`/services/${serviceId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
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
