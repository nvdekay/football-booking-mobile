import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../../context/AuthContext'
import { useTypingEmitter } from '../../../hooks/useChatSocket'
import { socketService } from '../../../services/socketService'
import { useChatStore } from '../../../stores/chatStore'
import { Message, SocketCallback, ReceiveMessageData } from '../../../types/chat'
import { ChatInput } from '../../(user)/chat/_components/ChatInput'
import { MessageBubble } from '../../(user)/chat/_components/MessageBubble'
import { TypingIndicator } from '../../(user)/chat/_components/TypingIndicator'

let tempIdCounter = -100000

export default function AdminChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const conversationId = Number(id)
  const router = useRouter()
  const { token, user } = useAuth()
  const flatListRef = useRef<FlatList<Message>>(null)

  const {
    messagesMap,
    typingUsers,
    conversations,
    fetchMessages,
    addOptimisticMessage,
    replaceOptimisticMessage,
    removeOptimisticMessage,
    updateConversationPreview,
    setActiveConversationId,
    decrementUnread,
  } = useChatStore()

  const messagesState = messagesMap[conversationId]
  const messages = messagesState?.data ?? []
  const isLoading = messagesState?.loading ?? false
  const hasMore = messagesState?.hasMore ?? true
  const conversationTyping = typingUsers[conversationId] ?? []

  const { handleTyping, stopTyping } = useTypingEmitter(conversationId)

  const conversation = conversations.find(
    (c) => c.conversation_id === conversationId
  )
  const otherParticipant = conversation?.participants.find(
    (p) => p.user_id !== user?.id
  )
  const headerTitle = otherParticipant?.full_name || 'Người dùng'

  useEffect(() => {
    setActiveConversationId(conversationId)
    if (token) {
      fetchMessages(token, conversationId, true)
      decrementUnread(conversationId)
    }
    return () => {
      setActiveConversationId(null)
    }
  }, [conversationId, token, fetchMessages, setActiveConversationId, decrementUnread])

  useEffect(() => {
    if (!token || !user || messages.length === 0) return
    const latestMessage = messages[0]
    if (
      latestMessage &&
      latestMessage.sender_id !== user.id &&
      latestMessage.status !== 'READ'
    ) {
      socketService.markAsRead({
        conversation_id: conversationId,
        message_id: latestMessage.message_id,
      })
    }
  }, [messages, conversationId, token, user])

  const handleLoadMore = useCallback(() => {
    if (!token || isLoading || !hasMore) return
    fetchMessages(token, conversationId)
  }, [token, isLoading, hasMore, conversationId, fetchMessages])

  const handleSend = useCallback(
    (text: string) => {
      if (!user || !token) return
      stopTyping()

      const tempId = tempIdCounter--
      const optimisticMessage: Message = {
        message_id: tempId,
        conversation_id: conversationId,
        sender_id: user.id,
        content: text,
        message_type: 'TEXT',
        status: 'SENT',
        created_at: new Date().toISOString(),
        is_deleted: false,
        sender_name: user.full_name,
        sender_avatar: user.avatar_url,
      }

      addOptimisticMessage(conversationId, optimisticMessage)

      socketService.sendMessage(
        {
          conversation_id: conversationId,
          content: text,
          message_type: 'TEXT',
        },
        (response: SocketCallback<ReceiveMessageData>) => {
          if (response.success && response.data) {
            replaceOptimisticMessage(conversationId, tempId, response.data)
            updateConversationPreview(conversationId, response.data)
          } else {
            removeOptimisticMessage(conversationId, tempId)
          }
        }
      )
    },
    [
      user,
      token,
      conversationId,
      stopTyping,
      addOptimisticMessage,
      replaceOptimisticMessage,
      removeOptimisticMessage,
      updateConversationPreview,
    ]
  )

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwn = item.sender_id === user?.id
      const nextMessage = messages[index + 1]
      const prevMessage = messages[index - 1]
      const showAvatar =
        !isOwn && (!nextMessage || nextMessage.sender_id !== item.sender_id)
      const isLastInGroup =
        !prevMessage || prevMessage.sender_id !== item.sender_id

      return (
        <MessageBubble
          message={item}
          isOwn={isOwn}
          showAvatar={showAvatar}
          isLastInGroup={isLastInGroup}
        />
      )
    },
    [user?.id, messages]
  )

  const keyExtractor = useCallback(
    (item: Message) => String(item.message_id),
    []
  )

  const ListHeaderComponent = useMemo(
    () => <TypingIndicator typingUsers={conversationTyping} />,
    [conversationTyping]
  )

  const ListFooterComponent = useMemo(() => {
    if (!isLoading) return null
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#089166" />
      </View>
    )
  }, [isLoading])

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={['top']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          className="flex-row items-center px-2 py-2.5 bg-white dark:bg-slate-900"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: '#d1fae5',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="p-2"
          >
            <MaterialIcons name="arrow-back" size={24} color="#334155" />
          </TouchableOpacity>

          {/* Avatar with online dot */}
          <View className="mx-2" style={{ position: 'relative' }}>
            {otherParticipant?.avatar_url ? (
              <Image
                source={{ uri: otherParticipant.avatar_url }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: '#089166',
                }}
              />
            ) : (
              <View
                className="size-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: '#d1fae5',
                  borderWidth: 2,
                  borderColor: '#089166',
                }}
              >
                <MaterialIcons name="person" size={22} color="#089166" />
              </View>
            )}
            {/* Online indicator */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#22c55e',
                borderWidth: 2,
                borderColor: '#ffffff',
              }}
            />
          </View>

          <View className="flex-1">
            <View className="flex-row items-center">
              <Text
                className="text-base font-bold text-slate-900 dark:text-white"
                numberOfLines={1}
                style={{ flexShrink: 1 }}
              >
                {headerTitle}
              </Text>
              {otherParticipant && (
                <View
                  className="ml-1.5 rounded px-1.5 py-0.5"
                  style={{
                    backgroundColor:
                      otherParticipant.role === 'ADMIN' ? '#dbeafe' : '#f0fdf4',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color:
                        otherParticipant.role === 'ADMIN' ? '#3b82f6' : '#16a34a',
                    }}
                  >
                    {otherParticipant.role === 'ADMIN' ? 'ADMIN' : 'USER'}
                  </Text>
                </View>
              )}
            </View>
            {conversationTyping.length > 0 ? (
              <Text className="text-xs" style={{ color: '#089166' }}>
                Đang nhập...
              </Text>
            ) : (
              <Text className="text-xs" style={{ color: '#089166' }}>
                Đang trực tuyến
              </Text>
            )}
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          inverted
          contentContainerStyle={{ paddingVertical: 8 }}
          style={{ backgroundColor: '#f5f8f7' }}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={Platform.OS === 'android'}
          maxToRenderPerBatch={15}
          windowSize={11}
          initialNumToRender={20}
          ListEmptyComponent={
            !isLoading ? (
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-slate-400 text-sm">
                  Hãy gửi tin nhắn đầu tiên!
                </Text>
              </View>
            ) : null
          }
        />

        {/* Input */}
        <ChatInput onSend={handleSend} onTyping={handleTyping} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
