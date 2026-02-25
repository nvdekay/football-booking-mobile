import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { getConfirmedBookings, processCheckIn } from '../../../api/admin'
import { useAuth } from '../../../context/AuthContext'
import { AdminBooking } from '../../../types/admin'

type FilterKey = 'ALL' | 'NOT_CHECKED_IN' | 'CHECKED_IN'

function formatPrice(price: number): string {
  return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '\u20ab'
}

export default function BookingsScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL')
  const [searchText, setSearchText] = useState('')

  const fetchBookings = async () => {
    if (!token) return
    try {
      const res = await getConfirmedBookings(token)
      setBookings(res.data)
    } catch (err: any) {
      console.error('Fetch bookings error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [token])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchBookings()
    setRefreshing(false)
  }

  const handleCheckIn = (booking: AdminBooking) => {
    Alert.alert(
      'Xác nhận check-in',
      `Check-in cho "${booking.user_name}" tại sân "${booking.field_name}"?\n\nNgày: ${booking.booking_date}\nGiờ: ${booking.start_time} - ${booking.end_time}`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            if (!token) return
            try {
              await processCheckIn(booking.check_in_code, token)
              Alert.alert('Thành công', 'Check-in thành công!')
              fetchBookings()
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể check-in.')
            }
          },
        },
      ]
    )
  }

  const handleSearchSubmit = () => {
    const code = searchText.trim()
    if (!code) return

    const found = bookings.find((b) => b.check_in_code === code)
    if (!found) {
      Alert.alert('Không tìm thấy', 'Không tìm thấy booking với mã check-in này.')
      return
    }
    if (found.check_in_time) {
      Alert.alert('Đã check-in', 'Booking này đã được check-in trước đó.')
      return
    }
    handleCheckIn(found)
  }

  const filteredBookings = useMemo(() => {
    let result = bookings
    if (activeFilter === 'NOT_CHECKED_IN') {
      result = result.filter((b) => !b.check_in_time)
    } else if (activeFilter === 'CHECKED_IN') {
      result = result.filter((b) => !!b.check_in_time)
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase()
      result = result.filter(
        (b) =>
          b.user_name.toLowerCase().includes(keyword) ||
          b.field_name.toLowerCase().includes(keyword) ||
          b.user_phone.includes(keyword) ||
          b.check_in_code.toLowerCase().includes(keyword)
      )
    }
    return result
  }, [bookings, activeFilter, searchText])

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'NOT_CHECKED_IN', label: 'Chưa check-in' },
    { key: 'CHECKED_IN', label: 'Đã check-in' },
  ]

  const renderBooking = ({ item }: { item: AdminBooking }) => {
    const isCheckedIn = !!item.check_in_time

    return (
      <View
        className="bg-white rounded-2xl p-4 mb-3"
        style={{
          borderWidth: 1,
          borderColor: isCheckedIn ? '#d1fae5' : '#f1f5f9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        {/* Field info */}
        <View className="flex-row items-center gap-2 mb-1">
          <MaterialIcons name="sports-soccer" size={18} color="#089166" />
          <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
            {item.field_name}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 mb-1">
          <MaterialIcons name="location-on" size={16} color="#94a3b8" />
          <Text className="text-xs text-gray-400 flex-1" numberOfLines={1}>
            {item.address}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 mb-1">
          <MaterialIcons name="event" size={16} color="#94a3b8" />
          <Text className="text-xs text-gray-400">{item.booking_date}</Text>
          <MaterialIcons name="access-time" size={16} color="#94a3b8" style={{ marginLeft: 8 }} />
          <Text className="text-xs text-gray-400">
            {item.start_time} - {item.end_time}
          </Text>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100 my-2.5" />

        {/* User info */}
        <View className="flex-row items-center gap-2 mb-1">
          <MaterialIcons name="person" size={16} color="#94a3b8" />
          <Text className="text-sm text-gray-700 font-medium">{item.user_name}</Text>
        </View>
        <View className="flex-row items-center gap-2 mb-2">
          <MaterialIcons name="phone" size={16} color="#94a3b8" />
          <Text className="text-sm text-gray-500">{item.user_phone}</Text>
          <View className="flex-1" />
          <Text className="text-sm font-bold text-gray-900">{formatPrice(item.total_price)}</Text>
        </View>

        {/* Check-in action */}
        {isCheckedIn ? (
          <View className="flex-row items-center gap-2 bg-emerald-50 rounded-xl p-3">
            <MaterialIcons name="check-circle" size={20} color="#089166" />
            <Text className="text-sm font-semibold text-emerald-700">Đã check-in</Text>
          </View>
        ) : (
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-xl py-3"
            style={{ backgroundColor: '#089166' }}
            onPress={() => handleCheckIn(item)}
          >
            <MaterialIcons name="qr-code-scanner" size={18} color="white" />
            <Text className="text-white text-sm font-bold">Check-in</Text>
          </TouchableOpacity>
        )}
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
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-3 bg-white"
        style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
      >
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900 flex-1 text-center">
          Check-in đặt sân
        </Text>
        <View className="w-10 h-10" />
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
            placeholder="Nhập mã check-in hoặc tên..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            autoCapitalize="none"
            returnKeyType="search"
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
                  borderBottomColor: isActive ? '#089166' : 'transparent',
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

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={(item) => String(item.booking_id)}
        renderItem={renderBooking}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialIcons name="event-available" size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-base mt-3">
              {searchText.trim() ? 'Không tìm thấy booking' : 'Chưa có booking nào'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
