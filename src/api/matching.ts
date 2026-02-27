import {
  CreateMatchingBody,
  MatchingSearchParams,
  PaginatedResponse,
  TeamMatching,
  TeamMatchingDetail,
} from '../types/matching'

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

export async function getMatchings(
  params?: MatchingSearchParams,
  token?: string
): Promise<ApiResponse<PaginatedResponse<TeamMatching>>> {
  const searchParams = new URLSearchParams()

  if (params?.date) searchParams.append('date', params.date)
  if (params?.level) searchParams.append('level', params.level)
  if (params?.page !== undefined) searchParams.append('page', params.page.toString())
  if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString())

  const query = searchParams.toString()
  return request<PaginatedResponse<TeamMatching>>(`/team-matchings${query ? `?${query}` : ''}`, {
    ...(token && { headers: { Authorization: `Bearer ${token}` } }),
  })
}

export async function getMatchingById(
  id: number,
  token: string
): Promise<ApiResponse<TeamMatchingDetail>> {
  return request<TeamMatchingDetail>(`/team-matchings/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function getMyMatchings(token: string): Promise<ApiResponse<TeamMatching[]>> {
  return request<TeamMatching[]>('/team-matchings/my-matchings', {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function createMatching(
  body: CreateMatchingBody,
  token: string
): Promise<ApiResponse<TeamMatching>> {
  return request<TeamMatching>('/team-matchings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  })
}

export async function joinMatching(
  id: number,
  token: string
): Promise<ApiResponse<TeamMatchingDetail>> {
  return request<TeamMatchingDetail>(`/team-matchings/${id}/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function leaveMatching(
  id: number,
  token: string
): Promise<ApiResponse<TeamMatchingDetail>> {
  return request<TeamMatchingDetail>(`/team-matchings/${id}/leave`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function confirmMatching(
  id: number,
  token: string
): Promise<ApiResponse<TeamMatchingDetail>> {
  return request<TeamMatchingDetail>(`/team-matchings/${id}/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function cancelMatching(
  id: number,
  reason: string | undefined,
  token: string
): Promise<ApiResponse<TeamMatchingDetail>> {
  return request<TeamMatchingDetail>(`/team-matchings/${id}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  })
}
