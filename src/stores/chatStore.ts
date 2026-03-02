import { create } from 'zustand'
import * as ChatApi from '../api/chat'
import {
  Conversation,
  Message,
  MessageReadData,
  ReceiveMessageData,
} from '../types/chat'

type MessagesState = {
  data: Message[]
  page: number
  hasMore: boolean
  loading: boolean
}

type ChatState = {
  // ─── Conversations ────────────────────────────────────────────
  conversations: Conversation[]
  conversationsLoading: boolean

  // ─── Messages per conversation ────────────────────────────────
  messagesMap: Record<number, MessagesState>

  // ─── Typing indicators ────────────────────────────────────────
  typingUsers: Record<number, { user_id: number; user_name: string }[]>

  // ─── Active conversation (currently viewing) ──────────────────
  activeConversationId: number | null

  // ─── Seen message IDs (dedup guard) ───────────────────────────
  seenMessageIds: Set<number>
}

type ChatActions = {
  // Conversations
  fetchConversations: (token: string) => Promise<void>
  updateConversationPreview: (
    conversationId: number,
    message: ReceiveMessageData
  ) => void
  decrementUnread: (conversationId: number) => void

  // Messages
  fetchMessages: (
    token: string,
    conversationId: number,
    reset?: boolean
  ) => Promise<void>
  addMessage: (conversationId: number, message: Message) => void
  addOptimisticMessage: (conversationId: number, message: Message) => void
  replaceOptimisticMessage: (
    conversationId: number,
    tempId: number,
    realMessage: Message
  ) => void
  removeOptimisticMessage: (conversationId: number, tempId: number) => void

  // Read receipts
  markMessageRead: (data: MessageReadData) => void

  // Typing
  setUserTyping: (
    conversationId: number,
    userId: number,
    userName: string
  ) => void
  clearUserTyping: (conversationId: number, userId: number) => void

  // Active conversation
  setActiveConversationId: (id: number | null) => void

  // Reset
  reset: () => void
}

const initialMessagesState: MessagesState = {
  data: [],
  page: 0,
  hasMore: true,
  loading: false,
}

const initialState: ChatState = {
  conversations: [],
  conversationsLoading: false,
  messagesMap: {},
  typingUsers: {},
  activeConversationId: null,
  seenMessageIds: new Set(),
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  ...initialState,

  // ─── Fetch Conversations ────────────────────────────────────────
  fetchConversations: async (token: string) => {
    set({ conversationsLoading: true })
    try {
      const res = await ChatApi.getConversations(token)
      set({ conversations: res.data, conversationsLoading: false })
    } catch (error) {
      console.error('[ChatStore] fetchConversations error:', error)
      set({ conversationsLoading: false })
    }
  },

  // ─── Update conversation list preview on new message ────────────
  updateConversationPreview: (conversationId, message) => {
    set((state) => {
      const conversations = state.conversations.map((conv) => {
        if (conv.conversation_id !== conversationId) return conv
        return {
          ...conv,
          last_message: {
            message_id: message.message_id,
            content: message.content,
            message_type: message.message_type,
            sender_id: message.sender_id,
            sender_name: message.sender_name,
            created_at: message.created_at,
          },
          last_message_at: message.created_at,
          // Only increment unread if not currently viewing this conversation
          unread_count:
            state.activeConversationId === conversationId
              ? conv.unread_count
              : conv.unread_count + 1,
        }
      })

      // Sort by last_message_at descending
      conversations.sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() -
          new Date(a.last_message_at).getTime()
      )

      return { conversations }
    })
  },

  decrementUnread: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.conversation_id === conversationId
          ? { ...conv, unread_count: 0 }
          : conv
      ),
    }))
  },

  // ─── Fetch Messages (paginated) ────────────────────────────────
  fetchMessages: async (token, conversationId, reset = false) => {
    const state = get()
    const current = state.messagesMap[conversationId] || initialMessagesState

    // Only block duplicate pagination requests, NOT reset requests
    if (!reset && current.loading) return
    if (!reset && !current.hasMore) return

    const nextPage = reset ? 1 : current.page + 1

    set((s) => ({
      messagesMap: {
        ...s.messagesMap,
        [conversationId]: {
          // When resetting, clear existing data immediately
          data: reset ? [] : (s.messagesMap[conversationId]?.data || []),
          page: reset ? 0 : (s.messagesMap[conversationId]?.page || 0),
          hasMore: true,
          loading: true,
        },
      },
    }))

    try {
      const res = await ChatApi.getMessages(token, conversationId, nextPage, 30)
      const newMessages = res.data

      set((s) => {
        const existing = reset ? [] : (s.messagesMap[conversationId]?.data || [])

        // Deduplicate by message_id
        const existingIds = new Set(existing.map((m) => m.message_id))
        const uniqueNew = newMessages.filter(
          (m) => !existingIds.has(m.message_id)
        )

        // Add new message IDs to dedup set
        const updatedSeen = new Set(s.seenMessageIds)
        newMessages.forEach((m) => updatedSeen.add(m.message_id))

        return {
          messagesMap: {
            ...s.messagesMap,
            [conversationId]: {
              data: reset ? newMessages : [...existing, ...uniqueNew],
              page: nextPage,
              hasMore: newMessages.length >= 30,
              loading: false,
            },
          },
          seenMessageIds: updatedSeen,
        }
      })
    } catch (error) {
      console.error('[ChatStore] fetchMessages error:', error)
      set((s) => ({
        messagesMap: {
          ...s.messagesMap,
          [conversationId]: {
            ...(s.messagesMap[conversationId] || initialMessagesState),
            loading: false,
          },
        },
      }))
    }
  },

  // ─── Add incoming real-time message ─────────────────────────────
  addMessage: (conversationId, message) => {
    set((state) => {
      // Dedup guard: skip if already seen
      if (state.seenMessageIds.has(message.message_id)) return state

      const current = state.messagesMap[conversationId] || initialMessagesState
      const updatedSeen = new Set(state.seenMessageIds)
      updatedSeen.add(message.message_id)

      return {
        messagesMap: {
          ...state.messagesMap,
          [conversationId]: {
            ...current,
            // Prepend (newest first for inverted FlatList)
            data: [message, ...current.data],
          },
        },
        seenMessageIds: updatedSeen,
      }
    })
  },

  // ─── Optimistic message (before server ack) ─────────────────────
  addOptimisticMessage: (conversationId, message) => {
    set((state) => {
      const current = state.messagesMap[conversationId] || initialMessagesState
      return {
        messagesMap: {
          ...state.messagesMap,
          [conversationId]: {
            ...current,
            data: [message, ...current.data],
          },
        },
      }
    })
  },

  replaceOptimisticMessage: (conversationId, tempId, realMessage) => {
    set((state) => {
      const current = state.messagesMap[conversationId]
      if (!current) return state

      const updatedSeen = new Set(state.seenMessageIds)
      updatedSeen.add(realMessage.message_id)

      return {
        messagesMap: {
          ...state.messagesMap,
          [conversationId]: {
            ...current,
            data: current.data.map((m) =>
              m.message_id === tempId ? realMessage : m
            ),
          },
        },
        seenMessageIds: updatedSeen,
      }
    })
  },

  removeOptimisticMessage: (conversationId, tempId) => {
    set((state) => {
      const current = state.messagesMap[conversationId]
      if (!current) return state
      return {
        messagesMap: {
          ...state.messagesMap,
          [conversationId]: {
            ...current,
            data: current.data.filter((m) => m.message_id !== tempId),
          },
        },
      }
    })
  },

  // ─── Mark message as read ───────────────────────────────────────
  markMessageRead: (data) => {
    set((state) => {
      const current = state.messagesMap[data.conversation_id]
      if (!current) return state
      return {
        messagesMap: {
          ...state.messagesMap,
          [data.conversation_id]: {
            ...current,
            data: current.data.map((m) =>
              m.message_id <= data.message_id && m.status !== 'READ'
                ? { ...m, status: 'READ' as const }
                : m
            ),
          },
        },
      }
    })
  },

  // ─── Typing Indicators ──────────────────────────────────────────
  setUserTyping: (conversationId, userId, userName) => {
    set((state) => {
      const current = state.typingUsers[conversationId] || []
      // Avoid duplicates
      if (current.some((t) => t.user_id === userId)) return state
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, { user_id: userId, user_name: userName }],
        },
      }
    })
  },

  clearUserTyping: (conversationId, userId) => {
    set((state) => {
      const current = state.typingUsers[conversationId]
      if (!current) return state
      const filtered = current.filter((t) => t.user_id !== userId)
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: filtered,
        },
      }
    })
  },

  // ─── Active Conversation ────────────────────────────────────────
  setActiveConversationId: (id) => {
    set({ activeConversationId: id })
  },

  // ─── Reset (on logout) ─────────────────────────────────────────
  reset: () => {
    set({ ...initialState, seenMessageIds: new Set() })
  },
}))
