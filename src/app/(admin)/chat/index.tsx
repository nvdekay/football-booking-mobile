import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../../context/AuthContext'
import { useChatStore } from '../../../stores/chatStore'
import { Conversation } from '../../../types/chat'
import { ChatListItem } from '../../(user)/chat/_components/ChatListItem'
import { EmptyChat } from '../../(user)/chat/_components/EmptyChat'

export default function AdminChatListScreen() {
  const { token, user } = useAuth()
  const router = useRouter()
  const {
    conversations,
    conversationsLoading,
    fetchConversations,
  } = useChatStore()
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchConversations(token)
      }
    }, [token, fetchConversations])
  )

  const handleRefresh = useCallback(async () => {
    if (!token) return
    setRefreshing(true)
    await fetchConversations(token)
    setRefreshing(false)
  }, [token, fetchConversations])

  const handlePressConversation = useCallback(
    (conversation: Conversation) => {
      router.push(`/(admin)/chat/${conversation.conversation_id}` as any)
    },
    [router]
  )

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ChatListItem
        conversation={item}
        currentUserId={user?.id ?? 0}
        currentUserRole={user?.role}
        onPress={handlePressConversation}
      />
    ),
    [user?.id, user?.role, handlePressConversation]
  )

  const keyExtractor = useCallback(
    (item: Conversation) => String(item.conversation_id),
    []
  )

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
        <MaterialIcons name="support-agent" size={24} color="#089166" />
        <Text className="text-xl font-bold text-slate-900 dark:text-white ml-2">
          Tin nhắn hỗ trợ
        </Text>
      </View>

      {conversationsLoading && conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#089166" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={
            <EmptyChat
              title="Chưa có tin nhắn"
              subtitle="Các cuộc hội thoại hỗ trợ từ người dùng sẽ hiển thị ở đây"
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#089166"
              colors={['#089166']}
            />
          }
          contentContainerStyle={
            conversations.length === 0 ? { flex: 1 } : undefined
          }
        />
      )}
    </SafeAreaView>
  )
}
