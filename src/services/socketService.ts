import { io, Socket } from 'socket.io-client'
import {
  ConversationUpdatedData,
  MarkAsReadPayload,
  MessageReadData,
  ReceiveMessageData,
  SendMessagePayload,
  SocketCallback,
  TypingPayload,
  UserStopTypingData,
  UserTypingData,
} from '../types/chat'

import { SOCKET_URL } from '../constants/api'

type SocketEventMap = {
  receive_message: (data: ReceiveMessageData) => void
  conversation_updated: (data: ConversationUpdatedData) => void
  message_read: (data: MessageReadData) => void
  user_typing: (data: UserTypingData) => void
  user_stop_typing: (data: UserStopTypingData) => void
}

class SocketService {
  private socket: Socket | null = null
  private listeners = new Map<string, Set<(...args: any[]) => void>>()
  private _isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10

  get isConnected(): boolean {
    return this._isConnected
  }

  connect(token: string): void {
    if (this.socket?.connected) return

    // Disconnect any stale socket before reconnecting
    this.disconnect()

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    })

    this.socket.on('connect', () => {
      this._isConnected = true
      this.reconnectAttempts = 0
      console.log('[Socket] Connected:', this.socket?.id)
    })

    this.socket.on('disconnect', (reason) => {
      this._isConnected = false
      console.log('[Socket] Disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      this._isConnected = false
      this.reconnectAttempts++
      console.log(
        '[Socket] Connection error:',
        error.message,
        `(attempt ${this.reconnectAttempts})`
      )
    })

    // Re-attach all registered listeners to the new socket instance
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => {
        this.socket?.on(event, cb)
      })
    })
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }
    this._isConnected = false
    this.reconnectAttempts = 0
  }

  // ─── Event Listeners ─────────────────────────────────────────
  on<K extends keyof SocketEventMap>(event: K, callback: SocketEventMap[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    this.socket?.on(event, callback as any)
  }

  off<K extends keyof SocketEventMap>(event: K, callback: SocketEventMap[K]): void {
    this.listeners.get(event)?.delete(callback)
    this.socket?.off(event, callback as any)
  }

  // ─── Emit Events ─────────────────────────────────────────────
  sendMessage(
    payload: SendMessagePayload,
    callback?: (response: SocketCallback<ReceiveMessageData>) => void
  ): void {
    this.socket?.emit('send_message', payload, callback)
  }

  markAsRead(
    payload: MarkAsReadPayload,
    callback?: (response: SocketCallback) => void
  ): void {
    this.socket?.emit('mark_as_read', payload, callback)
  }

  emitTyping(payload: TypingPayload): void {
    this.socket?.emit('typing', payload)
  }

  emitStopTyping(payload: TypingPayload): void {
    this.socket?.emit('stop_typing', payload)
  }
}

// Singleton export
export const socketService = new SocketService()
