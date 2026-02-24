import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { getRevenueStats } from '../../../api/admin'
import { useAuth } from '../../../context/AuthContext'
import { RevenueStats } from '../../../types/admin'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#d97706' },
  DEPOSIT_PAID: { label: 'Đã cọc', color: '#2563eb' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#089166' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444' },
  COMPLETED: { label: 'Hoàn thành', color: '#6b7280' },
  REFUNDED: { label: 'Đã hoàn tiền', color: '#8b5cf6' },
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

function formatCurrency(amount: number | string): string {
  return Number(amount).toLocaleString('vi-VN') + ' ₫'
}

export default function DashboardScreen() {
  const { token } = useAuth()

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [startDate, setStartDate] = useState(firstOfMonth)
  const [endDate, setEndDate] = useState(now)
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [stats, setStats] = useState<RevenueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async (start: Date, end: Date) => {
    if (!token) return
    try {
      const res = await getRevenueStats(formatDate(start), formatDate(end), token)
      setStats(res.data)
    } catch (err: any) {
      console.error('Fetch stats error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats(startDate, endDate)
  }, [token])

  const handleFetch = async () => {
    setLoading(true)
    await fetchStats(startDate, endDate)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      if (!token) return
      const res = await getRevenueStats(formatDate(startDate), formatDate(endDate), token)
      setStats(res.data)
    } catch (err: any) {
      console.error('Refresh stats error:', err.message)
    } finally {
      setRefreshing(false)
    }
  }

  const onStartDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false)
    if (selectedDate) setStartDate(selectedDate)
  }

  const onEndDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false)
    if (selectedDate) setEndDate(selectedDate)
  }

  const statusList = stats?.bookings_by_status ?? []

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text className="text-xl font-bold text-gray-900 mb-5">Thống Kê Doanh Thu</Text>

        {/* Date Range Picker */}
        <View className="flex-row items-center mb-3 gap-3">
          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3"
            onPress={() => setShowStartPicker(true)}
          >
            <Text className="text-xs text-gray-500 mb-0.5">Từ ngày</Text>
            <Text className="text-sm font-medium text-gray-900">
              {formatDisplayDate(startDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3"
            onPress={() => setShowEndPicker(true)}
          >
            <Text className="text-xs text-gray-500 mb-0.5">Đến ngày</Text>
            <Text className="text-sm font-medium text-gray-900">
              {formatDisplayDate(endDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onStartDateChange}
            maximumDate={endDate}
          />
        )}
        {Platform.OS === 'ios' && showStartPicker && (
          <TouchableOpacity
            className="items-center mb-2"
            onPress={() => setShowStartPicker(false)}
          >
            <Text className="text-[#089166] font-semibold">Xong</Text>
          </TouchableOpacity>
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={onEndDateChange}
            minimumDate={startDate}
            maximumDate={new Date()}
          />
        )}
        {Platform.OS === 'ios' && showEndPicker && (
          <TouchableOpacity
            className="items-center mb-2"
            onPress={() => setShowEndPicker(false)}
          >
            <Text className="text-[#089166] font-semibold">Xong</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="bg-[#089166] rounded-xl py-3.5 items-center mb-5"
          onPress={handleFetch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-semibold text-base">Xem thống kê</Text>
          )}
        </TouchableOpacity>

        {/* Revenue Card */}
        {stats && (
          <>
            <View className="bg-[#10221c] rounded-2xl p-5 mb-5">
              <Text className="text-emerald-400 text-sm mb-1">Tổng doanh thu</Text>
              <Text className="text-white text-2xl font-bold">
                {formatCurrency(stats.total_revenue)}
              </Text>
            </View>

            {/* Booking Status List */}
            {statusList.length > 0 && (
              <>
                <Text className="text-base font-semibold text-gray-900 mb-3">
                  Booking theo trạng thái
                </Text>
                <View className="bg-gray-50 rounded-2xl p-4">
                  {statusList.map((item) => {
                    const config = STATUS_CONFIG[item.status] || {
                      label: item.status,
                      color: '#6b7280',
                    }
                    return (
                      <View
                        key={item.status}
                        className="flex-row items-center justify-between py-2.5"
                      >
                        <View className="flex-row items-center gap-2.5">
                          <View
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <Text className="text-sm text-gray-700">{config.label}</Text>
                        </View>
                        <Text className="text-sm font-semibold text-gray-900">
                          {String(item.count)}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              </>
            )}
          </>
        )}

        {/* Empty state when no stats and not loading */}
        {!stats && !loading && (
          <View className="items-center py-10">
            <Text className="text-gray-400 text-sm">
              Chọn khoảng thời gian và bấm "Xem thống kê"
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
