// ─── Participant ───────────────────────────────────────────────
export type ChatParticipant = {
  user_id: number
  full_name: string
  avatar_url: string | null
  role: 'USER' | 'ADMIN'
  joined_at: string
  is_muted: boolean
}

// ─── Message ──────────────────────────────────────────────────
export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM'
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ'

export type Message = {
  message_id: number
  conversation_id: number
  sender_id: number
  content: string
  message_type: MessageType
  status: MessageStatus
  created_at: string
  is_deleted: boolean
  sender_name: string
  sender_avatar: string | null
}

// ─── Conversation ─────────────────────────────────────────────
export type ConversationType = 'PRIVATE' | 'SUPPORT' | 'GROUP'

export type LastMessage = {
  message_id: number
  content: string
  message_type: MessageType
  sender_id: number
  sender_name: string
  created_at: string
}

export type Conversation = {
  conversation_id: number
  type: ConversationType
  created_at: string
  last_message_at: string
  unread_count: number
  last_message: LastMessage | null
  participants: ChatParticipant[]
}

// ─── Socket Event Payloads ────────────────────────────────────

// Client → Server
export type SendMessagePayload = {
  conversation_id: number
  content: string
  message_type: MessageType
}

export type MarkAsReadPayload = {
  conversation_id: number
  message_id: number
}

export type TypingPayload = {
  conversation_id: number
}

// Server → Client
export type ReceiveMessageData = Message

export type ConversationUpdatedData = {
  conversation_id: number
  last_message: Message
}

export type MessageReadData = {
  conversation_id: number
  message_id: number
  read_by: number
  read_at: string
}

export type UserTypingData = {
  conversation_id: number
  user_id: number
  user_name: string
}

export type UserStopTypingData = {
  conversation_id: number
  user_id: number
}

// ─── Socket Callback ──────────────────────────────────────────
export type SocketCallback<T = unknown> = {
  success: boolean
  data?: T
  message?: string
}

// ─── API Response ─────────────────────────────────────────────
export type ChatApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

// ─── Create Conversation Response ─────────────────────────────
export type CreateConversationData = {
  conversation_id: number
  type: ConversationType
  created_by: number
  created_at: string
  last_message_id: number | null
  last_message_at: string
  participants: ChatParticipant[]
  is_new: boolean
}
