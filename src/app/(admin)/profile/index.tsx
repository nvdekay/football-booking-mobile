import React from 'react'
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../../context/AuthContext'

export default function AdminProfileScreen() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-6">
        <Text className="text-xl font-bold text-gray-900 mb-6">Tài Khoản</Text>
      </View>

      <View className="items-center px-6 mb-6">
        {user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} className="w-24 h-24 rounded-full mb-4" />
        ) : (
          <View className="w-24 h-24 rounded-full bg-red-100 items-center justify-center mb-4">
            <Text className="text-red-700 text-xl font-semibold">
              {user?.full_name ? user.full_name.charAt(0) : 'A'}
            </Text>
          </View>
        )}
        <Text className="text-xl font-semibold text-gray-900">{user?.full_name}</Text>
        <Text className="text-sm text-gray-500 mt-1">{user?.email || user?.phone_number}</Text>
        <View className="mt-2 bg-red-100 px-3 py-1 rounded-full">
          <Text className="text-red-700 text-xs font-medium">ADMIN</Text>
        </View>
      </View>

      <View className="bg-gray-50 mx-6 p-4 rounded-xl mb-6">
        <Text className="text-base font-semibold text-gray-900 mb-1">Trang Quản Trị</Text>
        <Text className="text-sm text-gray-500">
          Chào mừng bạn đến với trang quản trị hệ thống đặt sân bóng.
        </Text>
      </View>

      <View className="px-6">
        <TouchableOpacity
          className="bg-red-500 rounded-xl py-3.5 items-center"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold text-base">Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
