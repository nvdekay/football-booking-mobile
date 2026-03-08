import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ChatParticipant, Conversation } from '../../types/chat'

type Props = {
  conversation: Conversation
  currentUserId: number
  currentUserRole?: string
  onPress: (conversation: Conversation) => void
}

function getOtherParticipant(
  conversation: Conversation,
  currentUserId: number
): ChatParticipant | undefined {
  return (
    conversation.participants.find((p) => p.user_id !== currentUserId) ||
    conversation.participants[0]
  )
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) {
    return date.toLocaleDateString('vi-VN', { weekday: 'short' })
  }
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  })
}

export const ChatListItem = React.memo(function ChatListItem({
  conversation,
  currentUserId,
  currentUserRole,
  onPress,
}: Props) {
  const other = getOtherParticipant(conversation, currentUserId)
  const isAdmin = currentUserRole === 'ADMIN'

  // ─── Display name logic ──────────────────────────────────
  // User side: SUPPORT → "Hỗ trợ", PRIVATE → other's name
  // Admin side: always show the other participant's actual name
  let displayName: string
  if (isAdmin) {
    displayName = other?.full_name || 'Người dùng'
  } else {
    displayName =
      conversation.type === 'SUPPORT'
        ? 'Admin'
        : other?.full_name || 'Người dùng'
  }

  // ─── Role tag for admin view ─────────────────────────────
  const otherRole = other?.role
  const showRoleTag = isAdmin && otherRole

  // ─── Avatar ──────────────────────────────────────────────
  // Admin sees user icon (green), User sees support icon (amber) for SUPPORT
  const isSupport = conversation.type === 'SUPPORT'
  let avatarBg: string
  let avatarBorder: string
  let avatarIcon: keyof typeof MaterialIcons.glyphMap
  let avatarColor: string

  if (isAdmin) {
    // Admin always sees person icon representing the user
    avatarBg = '#d1fae5'
    avatarBorder = '#089166'
    avatarIcon = 'person'
    avatarColor = '#089166'
  } else if (isSupport) {
    avatarBg = '#fef3c7'
    avatarBorder = '#f59e0b'
    avatarIcon = 'support-agent'
    avatarColor = '#f59e0b'
  } else {
    avatarBg = '#d1fae5'
    avatarBorder = '#089166'
    avatarIcon = 'person'
    avatarColor = '#089166'
  }

  // ─── Last message preview ────────────────────────────────
  const lastMsg = conversation.last_message
  const hasUnread = conversation.unread_count > 0

  let previewText = 'Chưa có tin nhắn'
  if (lastMsg) {
    const prefix = lastMsg.sender_id === currentUserId ? 'Bạn: ' : ''
    previewText = `${prefix}${lastMsg.content}`
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-900"
      style={{
        borderBottomWidth: 0.5,
        borderBottomColor: '#f1f5f9',
      }}
    >
      {/* Avatar */}
      <View
        className="size-12 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: avatarBg,
          borderWidth: 1.5,
          borderColor: avatarBorder,
        }}
      >
        <MaterialIcons name={avatarIcon} size={24} color={avatarColor} />
      </View>

      {/* Content */}
      <View className="flex-1 mr-2">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1 mr-2">
            <Text
              className={`text-base ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'} dark:text-white`}
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >
              {displayName}
            </Text>
            {/* Role tag */}
            {showRoleTag && (
              <View
                className="ml-1.5 rounded px-1.5 py-0.5"
                style={{
                  backgroundColor:
                    otherRole === 'ADMIN' ? '#dbeafe' : '#f0fdf4',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: otherRole === 'ADMIN' ? '#3b82f6' : '#16a34a',
                  }}
                >
                  {otherRole === 'ADMIN' ? 'ADMIN' : 'USER'}
                </Text>
              </View>
            )}
          </View>
          {lastMsg && (
            <Text
              className={`text-xs ${hasUnread ? 'text-primary font-semibold' : 'text-slate-400'}`}
            >
              {formatTime(lastMsg.created_at)}
            </Text>
          )}
        </View>
        <View className="flex-row items-center justify-between">
          <Text
            className={`text-sm flex-1 mr-2 ${hasUnread ? 'font-semibold text-slate-700' : 'text-slate-500'} dark:text-slate-400`}
            numberOfLines={1}
          >
            {previewText}
          </Text>
          {hasUnread && (
            <View
              className="rounded-full items-center justify-center bg-primary"
              style={{
                minWidth: 20,
                height: 20,
                paddingHorizontal: 6,
              }}
            >
              <Text className="text-xs font-bold text-white">
                {conversation.unread_count > 99
                  ? '99+'
                  : conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
})
