import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'
import { Message } from '../../../../types/chat'

type Props = {
  message: Message
  isOwn: boolean
  showAvatar: boolean
  isLastInGroup: boolean
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ReadStatusIcon({ status }: { status: string }) {
  if (status === 'READ') {
    return <MaterialIcons name="done-all" size={14} color="#089166" />
  }
  if (status === 'DELIVERED') {
    return <MaterialIcons name="done-all" size={14} color="#94a3b8" />
  }
  return <MaterialIcons name="done" size={14} color="#94a3b8" />
}

export const MessageBubble = React.memo(function MessageBubble({
  message,
  isOwn,
  showAvatar,
  isLastInGroup,
}: Props) {
  // System message
  if (message.message_type === 'SYSTEM') {
    return (
      <View className="items-center my-2 px-4">
        <Text className="text-xs text-slate-400 dark:text-slate-500 italic text-center">
          {message.content}
        </Text>
      </View>
    )
  }

  // Deleted message
  if (message.is_deleted) {
    return (
      <View
        className={`flex-row ${isOwn ? 'justify-end' : 'justify-start'} px-4 mb-1`}
      >
        <View
          className="rounded-2xl px-3 py-2"
          style={{ backgroundColor: '#f1f5f9', maxWidth: '75%' }}
        >
          <Text className="text-sm text-slate-400 italic">
            Tin nhắn đã bị xóa
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View
      className={`flex-row ${isOwn ? 'justify-end' : 'justify-start'} px-4 ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}
    >
      {/* Other user's avatar placeholder */}
      {!isOwn && (
        <View style={{ width: 28, marginRight: 6 }}>
          {showAvatar && (
            <View
              className="size-7 rounded-full items-center justify-center"
              style={{ backgroundColor: '#d1fae5' }}
            >
              <MaterialIcons name="person" size={16} color="#089166" />
            </View>
          )}
        </View>
      )}

      {/* Bubble */}
      <View style={{ maxWidth: '75%' }}>
        {/* Sender name for group chats */}
        {!isOwn && showAvatar && (
          <Text className="text-xs text-slate-400 mb-0.5 ml-1">
            {message.sender_name}
          </Text>
        )}

        <View
          className={`rounded-2xl px-3 py-2 ${
            isOwn
              ? 'bg-primary'
              : 'bg-slate-100 dark:bg-slate-800'
          }`}
          style={
            isOwn
              ? {
                  borderBottomRightRadius: isLastInGroup ? 18 : 4,
                }
              : {
                  borderBottomLeftRadius: isLastInGroup ? 18 : 4,
                }
          }
        >
          <Text
            className={`text-[15px] leading-5 ${
              isOwn ? 'text-white' : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {message.content}
          </Text>
        </View>

        {/* Time + read status */}
        {isLastInGroup && (
          <View
            className={`flex-row items-center gap-1 mt-0.5 ${isOwn ? 'justify-end mr-1' : 'justify-start ml-1'}`}
          >
            <Text className="text-[10px] text-slate-400">
              {formatTime(message.created_at)}
            </Text>
            {isOwn && <ReadStatusIcon status={message.status} />}
          </View>
        )}
      </View>
    </View>
  )
})
