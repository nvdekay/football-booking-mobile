import { useRouter } from 'expo-router'
import React from 'react'
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../context/AuthContext'

export default function AdminScreen() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    // Navigation will be handled automatically by useProtectedRoute
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <View className="items-center mb-6">
        {user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} className="w-24 h-24 rounded-full mb-4" />
        ) : (
          <View className="w-24 h-24 rounded-full bg-red-100 items-center justify-center mb-4">
            <Text className="text-red-700 text-xl">{user?.full_name ? user.full_name.charAt(0) : 'A'}</Text>
          </View>
        )}
        <Text className="text-xl font-semibold">{user?.full_name}</Text>
        <Text className="text-sm text-gray-600">{user?.email || user?.phone_number}</Text>
        <View className="mt-2 bg-red-100 px-3 py-1 rounded-full">
          <Text className="text-red-700 text-xs font-medium">ADMIN</Text>
        </View>
      </View>

      <View className="bg-gray-50 p-4 rounded-lg mb-6">
        <Text className="text-lg font-semibold text-gray-900 mb-2">Trang Quản Trị</Text>
        <Text className="text-gray-600">Chào mừng bạn đến với trang quản trị hệ thống đặt sân bóng.</Text>
      </View>

      <TouchableOpacity className="bg-red-500 rounded py-3 items-center" onPress={handleLogout}>
        <Text className="text-white font-semibold">Đăng xuất đi cu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}