import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { getUsers, updateUserRole } from '../../../api/admin'
import { useAuth } from '../../../context/AuthContext'
import { AdminUser } from '../../../types/admin'

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN: { label: 'Admin', color: '#dc2626', bg: '#fef2f2' },
  OWNER: { label: 'Owner', color: '#7c3aed', bg: '#f5f3ff' },
  USER: { label: 'User', color: '#2563eb', bg: '#eff6ff' },
}

const ROLE_OPTIONS = ['USER', 'ADMIN', 'OWNER'] as const

export default function UsersScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

  const renderUser = ({ item }: { item: AdminUser }) => {
    const roleInfo = ROLE_CONFIG[item.role] || ROLE_CONFIG.USER

    return (
      <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-semibold text-gray-900 flex-1 mr-2" numberOfLines={1}>
            {item.full_name}
          </Text>
          <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: roleInfo.bg }}>
            <Text className="text-xs font-medium" style={{ color: roleInfo.color }}>
              {roleInfo.label}
            </Text>
          </View>
        </View>
        <Text className="text-sm text-gray-500">{item.email}</Text>
        {item.phone_number && (
          <Text className="text-sm text-gray-500">{item.phone_number}</Text>
        )}
        <View className="flex-row items-center justify-between mt-3">
          <Text className="text-xs text-gray-400">Trạng thái: {item.status}</Text>
          <TouchableOpacity
            className="bg-gray-100 rounded-xl px-3 py-1.5"
            onPress={() => handleChangeRole(item)}
          >
            <Text className="text-xs font-medium text-gray-700">Đổi vai trò</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#089166" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-6 pt-6 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Người Dùng</Text>
        <Text className="text-sm text-gray-400 ml-2">({users.length})</Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => String(item.user_id)}
        renderItem={renderUser}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialIcons name="people-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-base mt-3">Chưa có người dùng nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
