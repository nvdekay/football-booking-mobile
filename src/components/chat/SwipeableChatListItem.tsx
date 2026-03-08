import { MaterialIcons } from '@expo/vector-icons'
import React, { useCallback, useRef } from 'react'
import {
  Alert,
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { deleteConversation } from '../../api/chat'
import { useChatStore } from '../../stores/chatStore'
import { ChatParticipant, Conversation } from '../../types/chat'

type Props = {
  conversation: Conversation
  currentUserId: number
  currentUserRole?: string
  token: string
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

export const SwipeableChatListItem = React.memo(
  function SwipeableChatListItem({
    conversation,
    currentUserId,
    currentUserRole,
    token,
    onPress,
  }: Props) {
    const swipeableRef = useRef<Swipeable>(null)
    const removeConversation = useChatStore((s) => s.removeConversation)

    const other = getOtherParticipant(conversation, currentUserId)
    const isAdmin = currentUserRole === 'ADMIN'

    // ─── Display name ───────────────────────────────────────
    let displayName: string
    if (isAdmin) {
      displayName = other?.full_name || 'Người dùng'
    } else {
      displayName =
        conversation.type === 'SUPPORT'
          ? 'Admin'
          : other?.full_name || 'Người dùng'
    }

    // ─── Role tag for admin view ────────────────────────────
    const otherRole = other?.role
    const showRoleTag = isAdmin && otherRole

    // ─── Avatar ─────────────────────────────────────────────
    const isSupport = conversation.type === 'SUPPORT'
    const avatarUrl = other?.avatar_url
    const hasAvatar = !!avatarUrl

    // ─── Online indicator (has unread = active) ─────────────
    const hasUnread = conversation.unread_count > 0

    // ─── Last message preview ───────────────────────────────
    const lastMsg = conversation.last_message
    let previewText = 'Chưa có tin nhắn'
    if (lastMsg) {
      const prefix = lastMsg.sender_id === currentUserId ? 'Bạn: ' : ''
      previewText = `${prefix}${lastMsg.content}`
    }

    // ─── Delete handler ─────────────────────────────────────
    const handleDelete = useCallback(() => {
      swipeableRef.current?.close()
      Alert.alert(
        'Xóa cuộc trò chuyện',
        `Bạn có chắc muốn xóa cuộc trò chuyện với ${displayName}? Tất cả tin nhắn sẽ bị xóa vĩnh viễn.`,
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteConversation(token, conversation.conversation_id)
                removeConversation(conversation.conversation_id)
              } catch (error: any) {
                Alert.alert(
                  'Lỗi',
                  error?.message || 'Không thể xóa cuộc trò chuyện'
                )
              }
            },
          },
        ]
      )
    }, [token, conversation.conversation_id, displayName, removeConversation])

    // ─── Swipe right action (delete) ────────────────────────
    const renderRightActions = useCallback(
      (
        _progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>
      ) => {
        const scale = dragX.interpolate({
          inputRange: [-80, 0],
          outputRange: [1, 0.5],
          extrapolate: 'clamp',
        })
        return (
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#ef4444',
              justifyContent: 'center',
              alignItems: 'center',
              width: 80,
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale }],
                alignItems: 'center',
              }}
            >
              <MaterialIcons name="delete" size={24} color="white" />
              <Text style={{ color: 'white', fontSize: 12, marginTop: 2 }}>
                Xóa
              </Text>
            </Animated.View>
          </TouchableOpacity>
        )
      },
      [handleDelete]
    )

    return (
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity
          onPress={() => onPress(conversation)}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: 'white',
            borderBottomWidth: 0.5,
            borderBottomColor: '#f1f5f9',
          }}
        >
          {/* Avatar */}
          <View style={{ position: 'relative' }}>
            {hasAvatar ? (
              <Image
                source={{ uri: avatarUrl }}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  borderWidth: hasUnread ? 2 : 0,
                  borderColor: hasUnread ? '#0df2aa' : 'transparent',
                }}
              />
            ) : (
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor:
                    !isAdmin && isSupport ? '#fef3c7' : '#d1fae5',
                  borderWidth: hasUnread ? 2 : 0,
                  borderColor: hasUnread ? '#0df2aa' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons
                  name={!isAdmin && isSupport ? 'support-agent' : 'person'}
                  size={28}
                  color={!isAdmin && isSupport ? '#f59e0b' : '#089166'}
                />
              </View>
            )}
            {/* Online dot for unread */}
            {hasUnread && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: '#0df2aa',
                  borderWidth: 2,
                  borderColor: 'white',
                }}
              />
            )}
          </View>

          {/* Content */}
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  flex: 1,
                  marginRight: 8,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 16,
                    fontWeight: hasUnread ? '700' : '500',
                    color: '#0f172a',
                    flexShrink: 1,
                  }}
                >
                  {displayName}
                </Text>
                {showRoleTag && (
                  <View
                    style={{
                      marginLeft: 6,
                      borderRadius: 4,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
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
                  style={{
                    fontSize: 12,
                    fontWeight: hasUnread ? '500' : '400',
                    color: hasUnread ? '#0df2aa' : '#94a3b8',
                  }}
                >
                  {formatTime(lastMsg.created_at)}
                </Text>
              )}
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 14,
                  flex: 1,
                  marginRight: 8,
                  fontWeight: hasUnread ? '600' : '400',
                  color: hasUnread ? '#475569' : '#94a3b8',
                }}
              >
                {previewText}
              </Text>
              {hasUnread ? (
                <View
                  style={{
                    minWidth: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#0df2aa',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: '#0f172a',
                    }}
                  >
                    {conversation.unread_count > 99
                      ? '99+'
                      : conversation.unread_count}
                  </Text>
                </View>
              ) : (
                lastMsg &&
                lastMsg.sender_id === currentUserId && (
                  <MaterialIcons
                    name="done-all"
                    size={16}
                    color="#cbd5e1"
                  />
                )
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    )
  }
)
