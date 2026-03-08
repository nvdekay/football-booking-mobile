import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../../context/AuthContext'
import { useChatStore } from '../../../stores/chatStore'
import { Conversation } from '../../../types/chat'
import { SwipeableChatListItem } from '../../../components/chat/SwipeableChatListItem'
import { EmptyChat } from '../../../components/chat/EmptyChat'

type FilterTab = 'all' | 'unread'

export default function AdminChatListScreen() {
  const { token, user } = useAuth()
  const router = useRouter()
  const {
    conversations,
    conversationsLoading,
    fetchConversations,
  } = useChatStore()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

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

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let result = conversations

    // Tab filter
    if (activeTab === 'unread') {
      result = result.filter((c) => c.unread_count > 0)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((c) => {
        const other = c.participants.find(
          (p) => p.user_id !== (user?.id ?? 0)
        )
        const name = other?.full_name || ''
        const lastContent = c.last_message?.content || ''
        return (
          name.toLowerCase().includes(query) ||
          lastContent.toLowerCase().includes(query)
        )
      })
    }

    return result
  }, [conversations, activeTab, searchQuery, user?.id])

  // Unread count for badge
  const unreadCount = useMemo(
    () => conversations.filter((c) => c.unread_count > 0).length,
    [conversations]
  )

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <SwipeableChatListItem
        conversation={item}
        currentUserId={user?.id ?? 0}
        currentUserRole={user?.role}
        token={token || ''}
        onPress={handlePressConversation}
      />
    ),
    [user?.id, user?.role, token, handlePressConversation]
  )

  const keyExtractor = useCallback(
    (item: Conversation) => String(item.conversation_id),
    []
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: 'white' }}
        edges={['top']}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 0.5,
            borderBottomColor: '#e2e8f0',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'rgba(13, 242, 170, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialIcons name="chat-bubble" size={22} color="#089166" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#0f172a',
                }}
              >
                Hỗ trợ khách hàng
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: 'white',
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#f1f5f9',
              borderRadius: 12,
              height: 46,
            }}
          >
            <View style={{ paddingLeft: 14 }}>
              <MaterialIcons name="search" size={22} color="#94a3b8" />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Tìm kiếm khách hàng hoặc nội dung..."
              placeholderTextColor="#94a3b8"
              style={{
                flex: 1,
                fontSize: 15,
                color: '#0f172a',
                paddingHorizontal: 10,
                paddingVertical: 0,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{ paddingRight: 12 }}
              >
                <MaterialIcons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            gap: 24,
            backgroundColor: 'white',
            borderBottomWidth: 0.5,
            borderBottomColor: '#e2e8f0',
          }}
        >
          <TouchableOpacity
            onPress={() => setActiveTab('all')}
            style={{
              paddingTop: 8,
              paddingBottom: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === 'all' ? '#0df2aa' : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: activeTab === 'all' ? '#0f172a' : '#94a3b8',
              }}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('unread')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingTop: 8,
              paddingBottom: 12,
              borderBottomWidth: 2,
              borderBottomColor:
                activeTab === 'unread' ? '#0df2aa' : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: activeTab === 'unread' ? '#0f172a' : '#94a3b8',
              }}
            >
              Chưa đọc
            </Text>
            {unreadCount > 0 && (
              <View
                style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  backgroundColor: '#0df2aa',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: '700',
                    color: '#0f172a',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Conversation List */}
        {conversationsLoading && conversations.length === 0 ? (
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <ActivityIndicator size="large" color="#089166" />
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={
              activeTab === 'unread' ? (
                <EmptyChat
                  title="Không có tin nhắn chưa đọc"
                  subtitle="Tất cả các cuộc hội thoại đã được đọc"
                />
              ) : (
                <EmptyChat
                  title="Chưa có tin nhắn"
                  subtitle="Các cuộc hội thoại hỗ trợ từ người dùng sẽ hiển thị ở đây"
                />
              )
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
              filteredConversations.length === 0 ? { flex: 1 } : undefined
            }
          />
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}
