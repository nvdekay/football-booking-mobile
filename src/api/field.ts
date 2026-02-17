import { Field, FieldSearchParams } from '../types/field'

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

export async function getFields(params?: FieldSearchParams): Promise<ApiResponse<Field[]>> {
  const searchParams = new URLSearchParams()

  if (params?.keyword) searchParams.append('keyword', params.keyword)
  if (params?.type) searchParams.append('type', params.type)
  if (params?.min_price !== undefined) searchParams.append('min_price', params.min_price.toString())
  if (params?.max_price !== undefined) searchParams.append('max_price', params.max_price.toString())
  if (params?.rating !== undefined) searchParams.append('rating', params.rating.toString())

  const query = searchParams.toString()
  return request<Field[]>(`/fields${query ? `?${query}` : ''}`)
}
