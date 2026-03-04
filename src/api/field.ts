import { AvailabilityResponse } from '../types/booking'
import { Field, FieldDetail, FieldSearchParams } from '../types/field'
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

export async function getFields(params?: FieldSearchParams): Promise<ApiResponse<Field[]>> {
  const searchParams = new URLSearchParams()

  if (params?.keyword) searchParams.append('keyword', params.keyword)
  if (params?.type) searchParams.append('type', params.type)
  if (params?.min_price !== undefined) searchParams.append('min_price', params.min_price.toString())
  if (params?.max_price !== undefined) searchParams.append('max_price', params.max_price.toString())
  if (params?.rating !== undefined) searchParams.append('rating', params.rating.toString())
  if (params?.lat !== undefined) searchParams.append('lat', params.lat.toString())
  if (params?.long !== undefined) searchParams.append('long', params.long.toString())
  if (params?.sort_by) searchParams.append('sort_by', params.sort_by)

  const query = searchParams.toString()
  return request<Field[]>(`/fields${query ? `?${query}` : ''}`)
}

export async function getFieldById(id: number): Promise<ApiResponse<FieldDetail>> {
  return request<FieldDetail>(`/fields/${id}`)
}

export async function getAvailability(fieldId: number, date: string): Promise<ApiResponse<AvailabilityResponse>> {
  return request<AvailabilityResponse>(`/fields/${fieldId}/availability?date=${date}`)
}

export async function addFavorite(fieldId: number, token: string): Promise<ApiResponse<null>> {
  return request<null>(`/fields/${fieldId}/favorite`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function removeFavorite(fieldId: number, token: string): Promise<ApiResponse<null>> {
  return request<null>(`/fields/${fieldId}/favorite`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}
