import { MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { Image, Text, View } from 'react-native'
import { Message } from '../../types/chat'

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
      <View className="items-center my-3 px-4">
        <View
          className="rounded-full px-4 py-1.5"
          style={{ backgroundColor: '#e2e8f0' }}
        >
          <Text className="text-xs text-slate-500 font-medium text-center">
            {message.content}
          </Text>
        </View>
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
          className="rounded-2xl px-4 py-2.5"
          style={{
            backgroundColor: '#f1f5f9',
            maxWidth: '75%',
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}
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
      className={`flex-row ${isOwn ? 'justify-end pr-2' : 'justify-start pl-2'
        } ${isLastInGroup ? 'mb-3' : 'mb-0.5'}`}
    >
      {/* Other user's avatar */}
      {!isOwn && (
        <View style={{ width: 36, marginRight: 8 }}>
          {showAvatar &&
            (message.sender_avatar ? (
              <Image
                source={{ uri: message.sender_avatar }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: '#089166',
                }}
              />
            ) : (
              <View
                className="size-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor: '#d1fae5',
                  borderWidth: 2,
                  borderColor: '#089166',
                }}
              >
                <MaterialIcons name="person" size={18} color="#089166" />
              </View>
            ))}
        </View>
      )}

      {/* Bubble */}
      <View style={{ maxWidth: '72%' }}>
        {/* Sender name */}
        {!isOwn && showAvatar && (
          <Text
            className="text-xs mb-1 ml-1"
            style={{ color: '#089166', fontWeight: '600' }}
          >
            {message.sender_name}
          </Text>
        )}

        <View
          style={[
            {
              borderRadius: 18,
              paddingHorizontal: 14,
              paddingVertical: 10,
            },
            isOwn
              ? {
                backgroundColor: '#089166',
                borderBottomRightRadius: isLastInGroup ? 18 : 4,
                shadowColor: '#089166',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }
              : {
                backgroundColor: '#ffffff',
                borderBottomLeftRadius: isLastInGroup ? 18 : 4,
                borderWidth: 1,
                borderColor: '#d1fae5',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
                elevation: 1,
              },
          ]}
        >
          <Text
            style={{
              fontSize: 15,
              lineHeight: 21,
              color: isOwn ? '#ffffff' : '#1e293b',
            }}
          >
            {message.content}
          </Text>
        </View>

        {/* Time + read status */}
        {isLastInGroup && (
          <View
            className={`flex-row items-center gap-1 mt-1 ${isOwn ? 'justify-end mr-1' : 'justify-start ml-1'}`}
          >
            {isOwn && <ReadStatusIcon status={message.status} />}
            <Text className="text-[10px] text-slate-400">
              {formatTime(message.created_at)}
            </Text>
          </View>
        )}
      </View>

      {/* Own avatar (right side) */}
      {isOwn && (
        <View style={{ width: 36, marginLeft: 8 }}>
          {showAvatar &&
            (message.sender_avatar ? (
              <Image
                source={{ uri: message.sender_avatar }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  borderWidth: 2,
                  borderColor: '#089166',
                }}
              />
            ) : (
              <View
                className="size-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor: '#064e3b',
                  borderWidth: 2,
                  borderColor: '#089166',
                }}
              >
                <MaterialIcons name="person" size={18} color="#10b981" />
              </View>
            ))}
        </View>
      )}
    </View>
  )
})
