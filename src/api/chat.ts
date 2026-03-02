import {
  ChatApiResponse,
  Conversation,
  CreateConversationData,
  Message,
} from '../types/chat'

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1'

async function request<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<ChatApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  }

  const response = await fetch(url, { ...options, headers })
  const data = await response.json()

  if (!response.ok || (data && data.success === false)) {
    throw new Error(data?.message || 'Something went wrong')
  }

  return data
}

export async function getConversations(token: string) {
  return request<Conversation[]>('/chat/conversations', token)
}

export async function getMessages(
  token: string,
  conversationId: number,
  page: number = 1,
  limit: number = 30
) {
  return request<Message[]>(
    `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    token
  )
}

export async function createPrivateConversation(
  token: string,
  targetUserId: number
) {
  return request<CreateConversationData>('/chat/private', token, {
    method: 'POST',
    body: JSON.stringify({ target_user_id: targetUserId }),
  })
}

export async function createSupportConversation(token: string) {
  return request<CreateConversationData>('/chat/support', token, {
    method: 'POST',
  })
}

export async function deleteMessage(token: string, messageId: number) {
  return request<null>(`/chat/messages/${messageId}`, token, {
    method: 'DELETE',
  })
}
