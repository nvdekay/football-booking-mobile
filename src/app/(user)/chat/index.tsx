import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { createSupportConversation } from '../../../api/chat'
import { useAuth } from '../../../context/AuthContext'
import { useChatStore } from '../../../stores/chatStore'
import { Conversation } from '../../../types/chat'
import { ChatListItem } from './_components/ChatListItem'
import { EmptyChat } from './_components/EmptyChat'

export default function ChatListScreen() {
  const { token, user } = useAuth()
  const router = useRouter()
  const {
    conversations,
    conversationsLoading,
    fetchConversations,
  } = useChatStore()
  const [refreshing, setRefreshing] = useState(false)
  const [supportLoading, setSupportLoading] = useState(false)

  // Fetch conversations on focus
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
      router.push(`/(user)/chat/${conversation.conversation_id}` as any)
    },
    [router]
  )

  const handleCreateSupport = useCallback(async () => {
    if (!token) return
    setSupportLoading(true)
    try {
      const res = await createSupportConversation(token)
      await fetchConversations(token)
      router.push(`/(user)/chat/${res.data.conversation_id}` as any)
    } catch (error: any) {
      Alert.alert(
        'Lỗi',
        error?.message || 'Không thể tạo cuộc hội thoại hỗ trợ'
      )
    } finally {
      setSupportLoading(false)
    }
  }, [token, fetchConversations, router])

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
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-slate-100">
        <Text className="text-xl font-bold text-slate-900 dark:text-white">
          Tin nhắn
        </Text>
        <TouchableOpacity
          onPress={handleCreateSupport}
          disabled={supportLoading}
          activeOpacity={0.7}
          className="flex-row items-center bg-primary/10 rounded-full px-3 py-1.5"
        >
          {supportLoading ? (
            <ActivityIndicator size="small" color="#089166" />
          ) : (
            <>
              <MaterialIcons name="support-agent" size={18} color="#089166" />
              <Text className="text-sm font-semibold text-primary ml-1">
                Hỗ trợ
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Conversation List */}
      {conversationsLoading && conversations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#089166" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={<EmptyChat />}
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
