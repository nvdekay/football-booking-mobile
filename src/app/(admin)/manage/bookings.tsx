import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  adminRefundBooking,
  adminUpdateBookingStatus,
  getAllBookingsAdmin,
  getBookingDetailAdmin,
  processCheckIn,
} from '../../../api/admin'
import { useAuth } from '../../../context/AuthContext'
import { AdminBooking, AdminBookingDetail, BookingStatus } from '../../../types/admin'

type FilterKey = 'ALL' | 'PENDING_PAYMENT' | 'DEPOSIT_PAID' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_PAYMENT: { label: 'Chờ TT', color: '#d97706', bg: '#fffbeb' },
  DEPOSIT_PAID: { label: 'Đã cọc', color: '#2563eb', bg: '#eff6ff' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#089166', bg: '#ecfdf5' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
  COMPLETED: { label: 'Hoàn thành', color: '#0891b2', bg: '#ecfeff' },
  REFUNDED: { label: 'Hoàn tiền', color: '#8b5cf6', bg: '#f5f3ff' },
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING_PAYMENT', label: 'Chờ TT' },
  { key: 'DEPOSIT_PAID', label: 'Đã cọc' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'COMPLETED', label: 'Đã đá' },
  { key: 'REFUNDED', label: 'Hoàn tiền' },
]

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

  // Detail modal
  const [detailVisible, setDetailVisible] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [bookingDetail, setBookingDetail] = useState<AdminBookingDetail | null>(null)

  // Cancel modal
  const [cancelVisible, setCancelVisible] = useState(false)
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchBookings = async () => {
    if (!token) return
    try {
      const res = await getAllBookingsAdmin(token)
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

  const filteredBookings = useMemo(() => {
    let result = bookings
    if (activeFilter !== 'ALL') {
      result = result.filter((b) => b.status === activeFilter)
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

  // === Actions ===

  const handleStatusUpdate = async (bookingId: number, newStatus: BookingStatus, confirmMsg: string) => {
    Alert.alert('Xác nhận', confirmMsg, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          if (!token) return
          setActionLoading(true)
          try {
            await adminUpdateBookingStatus(bookingId, newStatus, token)
            Alert.alert('Thành công', `Đã cập nhật trạng thái`)
            fetchBookings()
          } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái')
          } finally {
            setActionLoading(false)
          }
        },
      },
    ])
  }

  const handleConfirm = (booking: AdminBooking) => {
    handleStatusUpdate(booking.booking_id, 'CONFIRMED', `Xác nhận booking của "${booking.user_name}" tại "${booking.field_name}"?`)
  }

  const handleComplete = (booking: AdminBooking) => {
    handleStatusUpdate(booking.booking_id, 'COMPLETED', `Đánh dấu hoàn thành booking của "${booking.user_name}" tại "${booking.field_name}"?`)
  }

  const openCancelModal = (bookingId: number) => {
    setCancelBookingId(bookingId)
    setCancelReason('')
    setCancelVisible(true)
  }

  const handleCancelSubmit = async () => {
    if (!token || !cancelBookingId) return
    setActionLoading(true)
    try {
      await adminUpdateBookingStatus(cancelBookingId, 'CANCELLED', token)
      Alert.alert('Thành công', 'Đã hủy booking')
      setCancelVisible(false)
      fetchBookings()
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể hủy booking')
    } finally {
      setActionLoading(false)
    }
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

  const handleRefund = (booking: AdminBooking) => {
    Alert.alert(
      'Xác nhận hoàn tiền',
      `Hoàn tiền cọc ${formatPrice(booking.deposit_amount)} cho "${booking.user_name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Hoàn tiền',
          style: 'destructive',
          onPress: async () => {
            if (!token) return
            setActionLoading(true)
            try {
              await adminRefundBooking(booking.booking_id, token)
              Alert.alert('Thành công', 'Đã hoàn tiền cọc vào ví người dùng')
              fetchBookings()
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể hoàn tiền')
            } finally {
              setActionLoading(false)
            }
          },
        },
      ]
    )
  }

  const openDetail = async (bookingId: number) => {
    if (!token) return
    setDetailVisible(true)
    setDetailLoading(true)
    try {
      const res = await getBookingDetailAdmin(bookingId, token)
      setBookingDetail(res.data)
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tải chi tiết')
      setDetailVisible(false)
    } finally {
      setDetailLoading(false)
    }
  }

  // === Render ===

  const renderStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' }
    return (
      <View style={{ backgroundColor: config.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ color: config.color, fontSize: 12, fontWeight: '700' }}>{config.label}</Text>
      </View>
    )
  }

  const renderActions = (item: AdminBooking) => {
    const status = item.status as BookingStatus
    const isCheckedIn = !!item.check_in_time

    if (status === 'CANCELLED' || status === 'REFUNDED') return null

    return (
      <View className="flex-row gap-2 mt-3">
        {status === 'DEPOSIT_PAID' && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{ backgroundColor: '#089166' }}
            onPress={() => handleConfirm(item)}
          >
            <MaterialIcons name="check-circle" size={16} color="white" />
            <Text className="text-white text-sm font-bold">Xác nhận</Text>
          </TouchableOpacity>
        )}

        {status === 'CONFIRMED' && !isCheckedIn && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{ backgroundColor: '#089166' }}
            onPress={() => handleCheckIn(item)}
          >
            <MaterialIcons name="qr-code-scanner" size={16} color="white" />
            <Text className="text-white text-sm font-bold">Check-in</Text>
          </TouchableOpacity>
        )}

        {status === 'CONFIRMED' && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{ backgroundColor: '#0891b2' }}
            onPress={() => handleComplete(item)}
          >
            <MaterialIcons name="done-all" size={16} color="white" />
            <Text className="text-white text-sm font-bold">Hoàn thành</Text>
          </TouchableOpacity>
        )}

        {(status === 'PENDING_PAYMENT' || status === 'DEPOSIT_PAID' || status === 'CONFIRMED') && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{ backgroundColor: '#ef4444' }}
            onPress={() => openCancelModal(item.booking_id)}
          >
            <MaterialIcons name="cancel" size={16} color="white" />
            <Text className="text-white text-sm font-bold">Hủy</Text>
          </TouchableOpacity>
        )}

        {status === 'COMPLETED' && (
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{ backgroundColor: '#8b5cf6' }}
            onPress={() => handleRefund(item)}
          >
            <MaterialIcons name="replay" size={16} color="white" />
            <Text className="text-white text-sm font-bold">Hoàn tiền</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  const renderBooking = ({ item }: { item: AdminBooking }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openDetail(item.booking_id)}
        className="bg-white rounded-2xl p-4 mb-3"
        style={{
          borderWidth: 1,
          borderColor: '#f1f5f9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        {/* Status + Price row */}
        <View className="flex-row items-center justify-between mb-2">
          {renderStatusBadge(item.status)}
          <Text className="text-sm font-bold text-gray-900">{formatPrice(item.total_price)}</Text>
        </View>

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
        <View className="h-px bg-gray-100 my-2" />

        {/* User info */}
        <View className="flex-row items-center gap-2 mb-1">
          <MaterialIcons name="person" size={16} color="#94a3b8" />
          <Text className="text-sm text-gray-700 font-medium">{item.user_name}</Text>
          <View className="flex-1" />
          <MaterialIcons name="phone" size={16} color="#94a3b8" />
          <Text className="text-sm text-gray-500">{item.user_phone}</Text>
        </View>

        {/* Check-in indicator */}
        {item.status === 'CONFIRMED' && item.check_in_time && (
          <View className="flex-row items-center gap-1.5 mt-1">
            <MaterialIcons name="check-circle" size={14} color="#089166" />
            <Text className="text-xs text-emerald-600 font-medium">Đã check-in</Text>
          </View>
        )}

        {/* Action buttons */}
        {renderActions(item)}
      </TouchableOpacity>
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
          Quản lý đặt sân
        </Text>
        <View className="w-10 h-10" />
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3 bg-white">
        <View
          className="flex-row items-center h-12 rounded-xl overflow-hidden"
          style={{ borderWidth: 1, borderColor: '#e2e8f0' }}
        >
          <View className="pl-4">
            <MaterialIcons name="search" size={22} color="#94a3b8" />
          </View>
          <TextInput
            className="flex-1 px-3 text-base text-gray-900 h-full"
            placeholder="Tìm theo tên sân, khách, SĐT, mã..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={setSearchText}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key
            return (
              <TouchableOpacity
                key={f.key}
                className="pb-3 pt-2 px-3"
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
        </ScrollView>
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

      {/* Cancel Modal */}
      <Modal visible={cancelVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-2xl p-6 mx-6" style={{ width: '85%' }}>
            <Text className="text-lg font-bold text-gray-900 mb-4">Hủy booking</Text>
            <Text className="text-sm text-gray-500 mb-3">Lý do hủy (tùy chọn):</Text>
            <TextInput
              className="border border-gray-200 rounded-xl p-3 text-base text-gray-900 mb-4"
              placeholder="Nhập lý do..."
              placeholderTextColor="#94a3b8"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center py-3 rounded-xl"
                style={{ backgroundColor: '#f1f5f9' }}
                onPress={() => setCancelVisible(false)}
              >
                <Text className="text-sm font-bold text-gray-600">Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center py-3 rounded-xl"
                style={{ backgroundColor: '#ef4444' }}
                onPress={handleCancelSubmit}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-sm font-bold text-white">Xác nhận hủy</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={detailVisible} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10" style={{ maxHeight: '80%' }}>
            {/* Modal header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Chi tiết booking</Text>
              <TouchableOpacity onPress={() => { setDetailVisible(false); setBookingDetail(null) }}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {detailLoading ? (
              <ActivityIndicator size="large" color="#089166" style={{ marginVertical: 40 }} />
            ) : bookingDetail ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Status */}
                <View className="flex-row items-center gap-2 mb-4">
                  {renderStatusBadge(bookingDetail.status)}
                  {bookingDetail.check_in_time && (
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="check-circle" size={14} color="#089166" />
                      <Text className="text-xs text-emerald-600 font-medium">Đã check-in</Text>
                    </View>
                  )}
                </View>

                {/* Field info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-3">
                  <Text className="text-sm font-bold text-gray-900 mb-1">{bookingDetail.field_name}</Text>
                  <Text className="text-xs text-gray-500 mb-2">{bookingDetail.address}</Text>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="event" size={14} color="#94a3b8" />
                      <Text className="text-xs text-gray-500">{bookingDetail.booking_date}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="access-time" size={14} color="#94a3b8" />
                      <Text className="text-xs text-gray-500">{bookingDetail.start_time} - {bookingDetail.end_time}</Text>
                    </View>
                  </View>
                </View>

                {/* User info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-3">
                  <View className="flex-row items-center gap-2 mb-1">
                    <MaterialIcons name="person" size={16} color="#94a3b8" />
                    <Text className="text-sm font-medium text-gray-900">{bookingDetail.user_name}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="phone" size={16} color="#94a3b8" />
                    <Text className="text-sm text-gray-500">{bookingDetail.user_phone}</Text>
                  </View>
                </View>

                {/* Price info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm text-gray-500">Tổng tiền</Text>
                    <Text className="text-sm font-bold text-gray-900">{formatPrice(bookingDetail.total_price)}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500">Tiền cọc</Text>
                    <Text className="text-sm font-bold text-gray-900">{formatPrice(bookingDetail.deposit_amount)}</Text>
                  </View>
                </View>

                {/* Services */}
                {bookingDetail.services && bookingDetail.services.length > 0 && (
                  <View className="bg-gray-50 rounded-xl p-4 mb-3">
                    <Text className="text-sm font-bold text-gray-900 mb-2">Dịch vụ đi kèm</Text>
                    {bookingDetail.services.map((s) => (
                      <View key={s.booking_service_id} className="flex-row justify-between mb-1">
                        <Text className="text-sm text-gray-600">
                          {s.service_name} x{s.quantity} ({s.unit})
                        </Text>
                        <Text className="text-sm text-gray-900">{formatPrice(s.price_at_booking * s.quantity)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Cancellation reason */}
                {bookingDetail.cancellation_reason && (
                  <View className="bg-red-50 rounded-xl p-4 mb-3">
                    <Text className="text-sm font-bold text-red-700 mb-1">Lý do hủy</Text>
                    <Text className="text-sm text-red-600">{bookingDetail.cancellation_reason}</Text>
                  </View>
                )}

                {/* Check-in code */}
                <View className="bg-gray-50 rounded-xl p-4 mb-3">
                  <Text className="text-xs text-gray-400">Mã check-in</Text>
                  <Text className="text-sm text-gray-700 font-mono" selectable>{bookingDetail.check_in_code}</Text>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
