import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { getUsers, updateUserRole } from '../../../api/admin'
import { useAuth } from '../../../context/AuthContext'
import { AdminUser } from '../../../types/admin'

const ROLE_CONFIG: Record<string, { label: string; badgeBg: string; badgeText: string; borderColor: string }> = {
  ADMIN: { label: 'ADMIN', badgeBg: '#0df2aa', badgeText: '#0f172a', borderColor: '#0df2aa' },
  OWNER: { label: 'OWNER', badgeBg: '#a78bfa', badgeText: '#ffffff', borderColor: '#a78bfa' },
  USER: { label: 'USER', badgeBg: '#f1f5f9', badgeText: '#64748b', borderColor: '#e2e8f0' },
}

const ROLE_OPTIONS = ['USER', 'ADMIN', 'OWNER'] as const

type FilterKey = 'ALL' | 'USER' | 'ADMIN'

export default function UsersScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL')
  const [searchText, setSearchText] = useState('')

  const fetchUsers = async () => {
    if (!token) return
    try {
      const res = await getUsers(token)
      setUsers(res.data)
    } catch (err: any) {
      console.error('Fetch users error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchUsers()
    setRefreshing(false)
  }

  const handleChangeRole = (user: AdminUser) => {
    const otherRoles = ROLE_OPTIONS.filter((r) => r !== user.role)
    Alert.alert(
      'Đổi vai trò',
      `Đổi vai trò của "${user.full_name}" (hiện tại: ${user.role})`,
      [
        { text: 'Hủy', style: 'cancel' },
        ...otherRoles.map((role) => ({
          text: role,
          onPress: async () => {
            if (!token) return
            try {
              await updateUserRole(user.user_id, role, token)
              Alert.alert('Thành công', `Đã đổi vai trò thành ${role}`)
              fetchUsers()
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể đổi vai trò.')
            }
          },
        })),
      ]
    )
  }

  const filteredUsers = useMemo(() => {
    let result = users
    if (activeFilter === 'USER') {
      result = result.filter((u) => u.role === 'USER')
    } else if (activeFilter === 'ADMIN') {
      result = result.filter((u) => u.role === 'ADMIN' || u.role === 'OWNER')
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase()
      result = result.filter(
        (u) =>
          u.full_name.toLowerCase().includes(keyword) ||
          u.email.toLowerCase().includes(keyword)
      )
    }
    return result
  }, [users, activeFilter, searchText])

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'USER', label: 'Người dùng' },
    { key: 'ADMIN', label: 'Quản trị viên' },
  ]

  const renderUser = ({ item }: { item: AdminUser }) => {
    const roleInfo = ROLE_CONFIG[item.role] || ROLE_CONFIG.USER
    const isAdmin = item.role === 'ADMIN' || item.role === 'OWNER'

    return (
      <View
        className="flex-row items-center px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: '#f8fafc', minHeight: 80 }}
      >
        <View className="flex-row items-center flex-1 gap-3">
          {/* Avatar */}
          {item.avatar_url ? (
            <Image
              source={{ uri: item.avatar_url }}
              className="h-12 w-12 rounded-full"
              style={{
                borderWidth: isAdmin ? 2 : 1,
                borderColor: isAdmin ? '#0df2aa' : '#e2e8f0',
              }}
            />
          ) : (
            <View
              className="h-12 w-12 rounded-full items-center justify-center bg-gray-100"
              style={{
                borderWidth: isAdmin ? 2 : 1,
                borderColor: isAdmin ? '#0df2aa' : '#e2e8f0',
              }}
            >
              <MaterialIcons name="person" size={24} color="#94a3b8" />
            </View>
          )}
          {/* Name & Email */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {item.full_name}
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5" numberOfLines={1}>
              {item.email}
            </Text>
          </View>
        </View>

        {/* Role badge + swap button */}
        <View className="flex-row items-center gap-2 ml-2">
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: roleInfo.badgeBg }}
          >
            <Text className="text-xs font-bold" style={{ color: roleInfo.badgeText }}>
              {roleInfo.label}
            </Text>
          </View>
          <TouchableOpacity
            className="p-2 rounded-lg bg-gray-100"
            onPress={() => handleChangeRole(item)}
          >
            <MaterialIcons name="swap-horiz" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0df2aa" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 bg-white"
        style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
      >
        <TouchableOpacity
          className="w-12 h-12 items-center justify-center"
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 flex-1 text-center">
          Quản lý người dùng
        </Text>
        <View className="w-12 items-center justify-end">
          <View className="w-10 h-10" />
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-4 bg-white">
        <View
          className="flex-row items-center h-12 rounded-xl overflow-hidden"
          style={{ borderWidth: 1, borderColor: '#e2e8f0' }}
        >
          <View className="pl-4">
            <MaterialIcons name="search" size={22} color="#94a3b8" />
          </View>
          <TextInput
            className="flex-1 px-3 text-base text-gray-900 h-full"
            placeholder="Tìm kiếm theo tên hoặc email..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />
          {searchText.length > 0 && (
            <TouchableOpacity className="pr-3" onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white" style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <View className="flex-row px-4 gap-6">
          {filters.map((f) => {
            const isActive = activeFilter === f.key
            return (
              <TouchableOpacity
                key={f.key}
                className="pb-3 pt-2"
                style={{
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? '#0df2aa' : 'transparent',
                }}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: isActive ? '#0f172a' : '#94a3b8' }}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item.user_id)}
        renderItem={renderUser}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialIcons name="people-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-base mt-3">
              {searchText.trim() ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
