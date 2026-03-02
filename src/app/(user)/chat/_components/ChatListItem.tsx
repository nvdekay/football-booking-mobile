import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Conversation } from '../../../../types/chat'

type Props = {
  conversation: Conversation
  currentUserId: number
  onPress: (conversation: Conversation) => void
}

function getOtherParticipant(conversation: Conversation, currentUserId: number) {
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

function getAvatarIcon(conversation: Conversation): keyof typeof MaterialIcons.glyphMap {
  if (conversation.type === 'SUPPORT') return 'support-agent'
  return 'person'
}

export const ChatListItem = React.memo(function ChatListItem({
  conversation,
  currentUserId,
  onPress,
}: Props) {
  const other = getOtherParticipant(conversation, currentUserId)
  const displayName =
    conversation.type === 'SUPPORT' ? 'Hỗ trợ' : other?.full_name || 'Người dùng'
  const lastMsg = conversation.last_message
  const hasUnread = conversation.unread_count > 0

  let previewText = 'Chưa có tin nhắn'
  if (lastMsg) {
    const prefix =
      lastMsg.sender_id === currentUserId ? 'Bạn: ' : ''
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
          backgroundColor: conversation.type === 'SUPPORT' ? '#fef3c7' : '#d1fae5',
          borderWidth: 1.5,
          borderColor: conversation.type === 'SUPPORT' ? '#f59e0b' : '#089166',
        }}
      >
        <MaterialIcons
          name={getAvatarIcon(conversation)}
          size={24}
          color={conversation.type === 'SUPPORT' ? '#f59e0b' : '#089166'}
        />
      </View>

      {/* Content */}
      <View className="flex-1 mr-2">
        <View className="flex-row items-center justify-between mb-1">
          <Text
            className={`text-base ${hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'} dark:text-white`}
            numberOfLines={1}
          >
            {displayName}
          </Text>
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
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
})
