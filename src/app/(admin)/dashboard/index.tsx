import { MaterialIcons } from '@expo/vector-icons'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
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
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#f59e0b' },
  DEPOSIT_PAID: { label: 'Đã cọc', color: '#3b82f6' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#10b981' },
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
  const { token, user } = useAuth()

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
  const totalBookings = statusList.reduce((sum, item) => sum + Number(item.count), 0)
  const completedCount = Number(statusList.find((s) => s.status === 'COMPLETED')?.count ?? 0)
  const cancelledCount = Number(statusList.find((s) => s.status === 'CANCELLED')?.count ?? 0)
  const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0
  const cancellationRate = totalBookings > 0 ? Math.round((cancelledCount / totalBookings) * 100) : 0

  const userInitials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((w) => w.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD'

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View
          className="bg-[#089166] px-6 pt-4 pb-8"
          style={{ borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-white/70 text-sm">Xin chào,</Text>
              <Text className="text-white text-xl font-bold">
                {user?.full_name || 'Admin'}
              </Text>
              <Text className="text-white/60 text-xs mt-1">
                Thống kê doanh thu hệ thống
              </Text>
            </View>
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                className="w-11 h-11 rounded-full"
                style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' }}
              />
            ) : (
              <View
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' }}
              >
                <Text className="text-white text-sm font-bold">{userInitials}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="px-5 -mt-5">
          {/* Date Filter Card */}
          <View
            className="bg-white rounded-2xl p-4 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Chọn khoảng thời gian
            </Text>
            <View className="flex-row items-center gap-3 mb-3">
              <TouchableOpacity
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
                onPress={() => setShowStartPicker(true)}
              >
                <Text className="text-[10px] text-gray-400 mb-0.5">Từ ngày</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {formatDisplayDate(startDate)}
                </Text>
              </TouchableOpacity>
              <MaterialIcons name="arrow-forward" size={16} color="#9ca3af" />
              <TouchableOpacity
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
                onPress={() => setShowEndPicker(true)}
              >
                <Text className="text-[10px] text-gray-400 mb-0.5">Đến ngày</Text>
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
              className={`rounded-xl py-3 items-center ${loading ? 'bg-gray-300' : 'bg-[#089166]'}`}
              onPress={handleFetch}
              disabled={loading}
            >
              {loading && !refreshing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white font-semibold text-sm">Áp dụng</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          {stats && (
            <>
              <View className="flex-row gap-3 mb-3">
                {/* Total Revenue */}
                <View
                  className="flex-1 bg-white rounded-2xl p-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="w-9 h-9 rounded-xl bg-[#089166]/10 items-center justify-center mb-2.5">
                    <MaterialIcons name="account-balance-wallet" size={20} color="#089166" />
                  </View>
                  <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                    {formatCurrency(stats.total_revenue)}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Tổng doanh thu</Text>
                </View>

                {/* Total Bookings */}
                <View
                  className="flex-1 bg-white rounded-2xl p-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="w-9 h-9 rounded-xl bg-blue-50 items-center justify-center mb-2.5">
                    <MaterialIcons name="event-note" size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-base font-bold text-gray-900">
                    {totalBookings}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Tổng đặt sân</Text>
                </View>
              </View>

              <View className="flex-row gap-3 mb-4">
                {/* Completion Rate */}
                <View
                  className="flex-1 bg-white rounded-2xl p-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="w-9 h-9 rounded-xl bg-emerald-50 items-center justify-center mb-2.5">
                    <MaterialIcons name="check-circle" size={20} color="#10b981" />
                  </View>
                  <Text className="text-base font-bold text-gray-900">
                    {completionRate}%
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Tỉ lệ hoàn thành</Text>
                </View>

                {/* Cancellation Rate */}
                <View
                  className="flex-1 bg-white rounded-2xl p-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View className="w-9 h-9 rounded-xl bg-red-50 items-center justify-center mb-2.5">
                    <MaterialIcons name="cancel" size={20} color="#ef4444" />
                  </View>
                  <Text className="text-base font-bold text-gray-900">
                    {cancellationRate}%
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">Tỉ lệ hủy</Text>
                </View>
              </View>

              {/* Booking Status Distribution */}
              {statusList.length > 0 && (
                <View
                  className="bg-white rounded-2xl p-4 mb-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Text className="text-base font-semibold text-gray-900 mb-4">
                    Phân bổ trạng thái đặt sân
                  </Text>

                  {/* Stacked horizontal bar */}
                  <View className="flex-row h-4 rounded-full overflow-hidden mb-4">
                    {statusList.map((item) => {
                      const pct =
                        totalBookings > 0
                          ? (Number(item.count) / totalBookings) * 100
                          : 0
                      if (pct === 0) return null
                      const config = STATUS_CONFIG[item.status] || {
                        label: item.status,
                        color: '#6b7280',
                      }
                      return (
                        <View
                          key={item.status}
                          style={{
                            width: `${pct}%` as any,
                            backgroundColor: config.color,
                          }}
                        />
                      )
                    })}
                  </View>

                  {/* Status legend */}
                  {statusList.map((item, index) => {
                    const config = STATUS_CONFIG[item.status] || {
                      label: item.status,
                      color: '#6b7280',
                    }
                    const pct =
                      totalBookings > 0
                        ? Math.round((Number(item.count) / totalBookings) * 100)
                        : 0
                    const isLast = index === statusList.length - 1
                    return (
                      <View
                        key={item.status}
                        className={`flex-row items-center justify-between py-2.5 ${
                          !isLast ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <View className="flex-row items-center gap-2.5">
                          <View
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: config.color }}
                          />
                          <Text className="text-sm text-gray-700">{config.label}</Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-semibold text-gray-900">
                            {String(item.count)}
                          </Text>
                          <Text className="text-xs text-gray-400">({pct}%)</Text>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}

              {/* Individual Status Detail Cards */}
              {statusList.length > 0 && (
                <View
                  className="bg-white rounded-2xl p-4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Text className="text-base font-semibold text-gray-900 mb-3">
                    Chi tiết theo trạng thái
                  </Text>
                  {statusList.map((item) => {
                    const config = STATUS_CONFIG[item.status] || {
                      label: item.status,
                      color: '#6b7280',
                    }
                    const pct =
                      totalBookings > 0
                        ? (Number(item.count) / totalBookings) * 100
                        : 0
                    return (
                      <View key={item.status} className="mb-3">
                        <View className="flex-row items-center justify-between mb-1">
                          <Text className="text-sm text-gray-700">{config.label}</Text>
                          <Text className="text-sm font-medium text-gray-900">
                            {String(item.count)} booking
                          </Text>
                        </View>
                        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <View
                            className="h-2 rounded-full"
                            style={{
                              width: `${pct}%` as any,
                              backgroundColor: config.color,
                            }}
                          />
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}
            </>
          )}

          {/* Empty state */}
          {!stats && !loading && (
            <View
              className="bg-white rounded-2xl p-8 items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <MaterialIcons name="bar-chart" size={48} color="#d1d5db" />
              <Text className="text-gray-400 text-sm mt-3 text-center">
                Chọn khoảng thời gian và bấm "Áp dụng" để xem thống kê
              </Text>
            </View>
          )}

          {/* Loading state (initial load only) */}
          {loading && !refreshing && !stats && (
            <View className="items-center py-10">
              <ActivityIndicator size="large" color="#089166" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
