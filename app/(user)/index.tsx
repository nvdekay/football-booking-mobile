import { useRouter } from 'expo-router'
import React from 'react'
import { Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../src/context/AuthContext'

export default function UserHome() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.replace('/(auth)/login')
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <View className="items-center mb-6">
        {user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} className="w-24 h-24 rounded-full mb-4" />
        ) : (
          <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-4">
            <Text className="text-green-700 text-xl">{user?.full_name ? user.full_name.charAt(0) : 'U'}</Text>
          </View>
        )}
        <Text className="text-xl font-semibold">{user?.full_name}</Text>
        <Text className="text-sm text-gray-600">{user?.email || user?.phone_number}</Text>
      </View>

      <TouchableOpacity className="bg-red-500 rounded py-3 items-center" onPress={handleLogout}>
        <Text className="text-white">Đăng xuất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}
