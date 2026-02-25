import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'

const MENU_ITEMS = [
  {
    title: 'Quản lý người dùng',
    description: 'Xem danh sách, thay đổi vai trò người dùng',
    icon: 'people' as const,
    route: '/(admin)/manage/users',
  },
  {
    title: 'Quản lý dịch vụ',
    description: 'Thêm, xóa dịch vụ phụ trợ (nước, áo, ...)',
    icon: 'room-service' as const,
    route: '/(admin)/manage/services',
  },
  {
    title: 'Check-in đặt sân',
    description: 'Xác nhận check-in cho khách đã thanh toán',
    icon: 'qr-code-scanner' as const,
    route: '/(admin)/manage/bookings',
  },
]

export default function ManageIndexScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-3">
        <Text className="text-xl font-bold text-gray-900">Quản Lý</Text>
      </View>

      <View className="px-6">
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.route}
            className="flex-row items-center bg-gray-50 rounded-2xl p-4 mb-3"
            onPress={() => router.push(item.route as any)}
          >
            <View className="w-12 h-12 rounded-xl bg-[#089166]/10 items-center justify-center mr-4">
              <MaterialIcons name={item.icon} size={24} color="#089166" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
              <Text className="text-sm text-gray-500 mt-0.5">{item.description}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}
