import { useCallback, useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { socketService } from '../services/socketService'
import { useChatStore } from '../stores/chatStore'
import {
  ConversationUpdatedData,
  MessageReadData,
  ReceiveMessageData,
  UserStopTypingData,
  UserTypingData,
} from '../types/chat'

/**
 * Initializes socket connection and registers global listeners.
 * Should be mounted ONCE at app level (e.g., in user _layout).
 */
export function useChatSocketInit(token: string | null) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState)

  useEffect(() => {
    if (!token) return

    socketService.connect(token)

    // Handle app foreground/background
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (
          appStateRef.current.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          // App returned to foreground — reconnect if needed
          if (!socketService.isConnected) {
            socketService.connect(token)
          }
        }
        appStateRef.current = nextState
      }
    )

    return () => {
      subscription.remove()
      socketService.disconnect()
    }
  }, [token])
}

/**
 * Registers chat event listeners for the global conversation list.
 * Mount alongside useChatSocketInit.
 */
export function useChatListeners(currentUserId: number | null) {
  const {
    addMessage,
    updateConversationPreview,
    markMessageRead,
    setUserTyping,
    clearUserTyping,
    activeConversationId,
  } = useChatStore()

  // Use refs to avoid stale closures in socket callbacks
  const activeConvRef = useRef(activeConversationId)
  activeConvRef.current = activeConversationId

  const currentUserRef = useRef(currentUserId)
  currentUserRef.current = currentUserId

  useEffect(() => {
    if (!currentUserId) return

    const onReceiveMessage = (data: ReceiveMessageData) => {
      // Don't add own messages (already handled optimistically)
      if (data.sender_id === currentUserRef.current) return

      // Add to messages if that conversation is loaded
      useChatStore.getState().addMessage(data.conversation_id, data)

      // Update conversation list preview
      useChatStore.getState().updateConversationPreview(data.conversation_id, data)
    }

    const onConversationUpdated = (data: ConversationUpdatedData) => {
      // Already handled by receive_message for message content
      // This is a lightweight hint to re-sort the list
      useChatStore
        .getState()
        .updateConversationPreview(data.conversation_id, data.last_message)
    }

    const onMessageRead = (data: MessageReadData) => {
      useChatStore.getState().markMessageRead(data)
    }

    const onUserTyping = (data: UserTypingData) => {
      if (data.user_id === currentUserRef.current) return
      useChatStore
        .getState()
        .setUserTyping(data.conversation_id, data.user_id, data.user_name)

      // Auto-clear typing after 4 seconds
      setTimeout(() => {
        useChatStore
          .getState()
          .clearUserTyping(data.conversation_id, data.user_id)
      }, 4000)
    }

    const onUserStopTyping = (data: UserStopTypingData) => {
      useChatStore
        .getState()
        .clearUserTyping(data.conversation_id, data.user_id)
    }

    socketService.on('receive_message', onReceiveMessage)
    socketService.on('conversation_updated', onConversationUpdated)
    socketService.on('message_read', onMessageRead)
    socketService.on('user_typing', onUserTyping)
    socketService.on('user_stop_typing', onUserStopTyping)

    return () => {
      socketService.off('receive_message', onReceiveMessage)
      socketService.off('conversation_updated', onConversationUpdated)
      socketService.off('message_read', onMessageRead)
      socketService.off('user_typing', onUserTyping)
      socketService.off('user_stop_typing', onUserStopTyping)
    }
  }, [currentUserId])
}

/**
 * Typing debounce hook for chat detail screen.
 */
export function useTypingEmitter(conversationId: number) {
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  const handleTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      socketService.emitTyping({ conversation_id: conversationId })
    }

    // Reset the stop-typing timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false
      socketService.emitStopTyping({ conversation_id: conversationId })
    }, 2000)
  }, [conversationId])

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    if (isTypingRef.current) {
      isTypingRef.current = false
      socketService.emitStopTyping({ conversation_id: conversationId })
    }
  }, [conversationId])

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTypingRef.current) {
        socketService.emitStopTyping({ conversation_id: conversationId })
      }
    }
  }, [conversationId])

  return { handleTyping, stopTyping }
}
