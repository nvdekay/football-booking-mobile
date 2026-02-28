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
  adminDeleteMatching,
  adminUpdateMatchingStatus,
  getAllMatchingsAdmin,
} from '../../../api/admin'
import { getFields } from '../../../api/field'
import { useAuth } from '../../../context/AuthContext'
import { AdminTeamMatching, MatchingStatus } from '../../../types/admin'
import { Field } from '../../../types/field'

type FilterKey = 'ALL' | MatchingStatus

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Đang mở', color: '#2563eb', bg: '#eff6ff' },
  MATCHED: { label: 'Đã ghép', color: '#d97706', bg: '#fffbeb' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#089166', bg: '#ecfdf5' },
  COMPLETED: { label: 'Hoàn thành', color: '#0891b2', bg: '#ecfeff' },
  CANCELLED: { label: 'Đã hủy', color: '#ef4444', bg: '#fef2f2' },
  EXPIRED: { label: 'Hết hạn', color: '#6b7280', bg: '#f3f4f6' },
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  VUI_VE: { label: 'Vui vẻ', color: '#089166', bg: '#ecfdf5' },
  BAN_CHUYEN: { label: 'Bán chuyên', color: '#d97706', bg: '#fffbeb' },
  CHUYEN_NGHIEP: { label: 'Chuyên nghiệp', color: '#dc2626', bg: '#fef2f2' },
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'OPEN', label: 'Đang mở' },
  { key: 'MATCHED', label: 'Đã ghép' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'EXPIRED', label: 'Hết hạn' },
]

const ALL_STATUSES: { status: MatchingStatus; label: string; color: string }[] = [
  { status: 'OPEN', label: 'Đang mở', color: '#2563eb' },
  { status: 'MATCHED', label: 'Đã ghép', color: '#d97706' },
  { status: 'CONFIRMED', label: 'Đã xác nhận', color: '#089166' },
  { status: 'COMPLETED', label: 'Hoàn thành', color: '#0891b2' },
  { status: 'CANCELLED', label: 'Đã hủy', color: '#ef4444' },
  { status: 'EXPIRED', label: 'Hết hạn', color: '#6b7280' },
]

export default function MatchingsScreen() {
  const router = useRouter()
  const { token } = useAuth()

  const [matchings, setMatchings] = useState<AdminTeamMatching[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL')
  const [searchText, setSearchText] = useState('')

  // Field filter
  const [fields, setFields] = useState<Field[]>([])
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null)

  // Detail modal
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedMatching, setSelectedMatching] = useState<AdminTeamMatching | null>(null)

  // Status change modal
  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [statusChangeTarget, setStatusChangeTarget] = useState<AdminTeamMatching | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchFields = async () => {
    try {
      const res = await getFields()
      setFields(res.data)
    } catch (err: any) {
      console.error('Fetch fields error:', err.message)
    }
  }

  const fetchMatchings = async (fieldId?: number | null) => {
    if (!token) return
    try {
      const filters: any = { limit: 100 }
      const fId = fieldId !== undefined ? fieldId : selectedFieldId
      if (fId) filters.field_id = fId
      const res = await getAllMatchingsAdmin(filters, token)
      setMatchings(res.data.items)
    } catch (err: any) {
      console.error('Fetch matchings error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFields()
  }, [])

  useEffect(() => {
    fetchMatchings()
  }, [token])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchMatchings()
    setRefreshing(false)
  }

  const handleFieldSelect = (fieldId: number | null) => {
    setSelectedFieldId(fieldId)
    setLoading(true)
    fetchMatchings(fieldId)
  }

  const filteredMatchings = useMemo(() => {
    let result = matchings
    if (activeFilter !== 'ALL') {
      result = result.filter((m) => m.status === activeFilter)
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase()
      result = result.filter(
        (m) =>
          m.host_name.toLowerCase().includes(keyword) ||
          (m.field_name && m.field_name.toLowerCase().includes(keyword)) ||
          m.host_phone.includes(keyword)
      )
    }
    return result
  }, [matchings, activeFilter, searchText])

  // === Actions ===

  const openDetail = (matching: AdminTeamMatching) => {
    setSelectedMatching(matching)
    setDetailVisible(true)
  }

  const openStatusModal = (matching: AdminTeamMatching) => {
    setStatusChangeTarget(matching)
    setStatusModalVisible(true)
  }

  const handleStatusChange = (newStatus: MatchingStatus) => {
    if (!statusChangeTarget || !token) return
    const statusLabel = ALL_STATUSES.find((s) => s.status === newStatus)?.label || newStatus
    setStatusModalVisible(false)

    Alert.alert(
      'Xác nhận đổi trạng thái',
      `Đổi trạng thái kèo #${statusChangeTarget.matching_id} sang "${statusLabel}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            setActionLoading(true)
            try {
              await adminUpdateMatchingStatus(statusChangeTarget.matching_id, newStatus, token)
              Alert.alert('Thành công', 'Đã cập nhật trạng thái')
              fetchMatchings()
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái')
            } finally {
              setActionLoading(false)
            }
          },
        },
      ]
    )
  }

  const handleDelete = (matching: AdminTeamMatching) => {
    if (!token) return
    Alert.alert(
      'Xác nhận xóa',
      `Xóa kèo đấu #${matching.matching_id} của "${matching.host_name}"?\n\nHành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true)
            try {
              await adminDeleteMatching(matching.matching_id, token)
              Alert.alert('Thành công', 'Đã xóa kèo đấu')
              fetchMatchings()
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa kèo đấu')
            } finally {
              setActionLoading(false)
            }
          },
        },
      ]
    )
  }

  // === Render helpers ===

  const renderStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || { label: status, color: '#6b7280', bg: '#f3f4f6' }
    return (
      <View style={{ backgroundColor: config.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ color: config.color, fontSize: 12, fontWeight: '700' }}>{config.label}</Text>
      </View>
    )
  }

  const renderLevelBadge = (level: string) => {
    const config = LEVEL_CONFIG[level] || { label: level, color: '#6b7280', bg: '#f3f4f6' }
    return (
      <View style={{ backgroundColor: config.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ color: config.color, fontSize: 12, fontWeight: '700' }}>{config.label}</Text>
      </View>
    )
  }

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      return m > 0 ? `${h}h${m}p` : `${h}h`
    }
    return `${minutes}p`
  }

  const renderMatching = ({ item }: { item: AdminTeamMatching }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openDetail(item)}
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
        {/* Status + Level badges */}
        <View className="flex-row items-center gap-2 mb-2">
          {renderStatusBadge(item.status)}
          {renderLevelBadge(item.level)}
        </View>

        {/* Field info */}
        {item.field_name && (
          <>
            <View className="flex-row items-center gap-2 mb-1">
              <MaterialIcons name="sports-soccer" size={18} color="#089166" />
              <Text className="text-base font-semibold text-gray-900 flex-1" numberOfLines={1}>
                {item.field_name}
              </Text>
            </View>
            {item.field_address && (
              <View className="flex-row items-center gap-2 mb-1">
                <MaterialIcons name="location-on" size={16} color="#94a3b8" />
                <Text className="text-xs text-gray-400 flex-1" numberOfLines={1}>
                  {item.field_address}
                </Text>
              </View>
            )}
          </>
        )}

        {/* Date + Time + Duration */}
        <View className="flex-row items-center gap-2 mb-1">
          <MaterialIcons name="event" size={16} color="#94a3b8" />
          <Text className="text-xs text-gray-400">{item.match_date}</Text>
          <MaterialIcons name="access-time" size={16} color="#94a3b8" style={{ marginLeft: 8 }} />
          <Text className="text-xs text-gray-400">{item.start_time}</Text>
          <MaterialIcons name="timer" size={16} color="#94a3b8" style={{ marginLeft: 8 }} />
          <Text className="text-xs text-gray-400">{formatDuration(item.duration)}</Text>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100 my-2" />

        {/* Host info */}
        <View className="flex-row items-center gap-2 mb-1">
          <MaterialIcons name="person" size={16} color="#94a3b8" />
          <Text className="text-sm text-gray-700 font-medium">{item.host_name}</Text>
          <View className="flex-1" />
          <MaterialIcons name="phone" size={16} color="#94a3b8" />
          <Text className="text-sm text-gray-500">{item.host_phone}</Text>
        </View>

        {/* Confirmation indicators when MATCHED */}
        {item.status === 'MATCHED' && (
          <View className="flex-row items-center gap-3 mt-1">
            <View className="flex-row items-center gap-1">
              <MaterialIcons
                name={item.host_confirmed ? 'check-circle' : 'radio-button-unchecked'}
                size={14}
                color={item.host_confirmed ? '#089166' : '#d1d5db'}
              />
              <Text className="text-xs" style={{ color: item.host_confirmed ? '#089166' : '#9ca3af' }}>
                Host xác nhận
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MaterialIcons
                name={item.challenger_confirmed ? 'check-circle' : 'radio-button-unchecked'}
                size={14}
                color={item.challenger_confirmed ? '#089166' : '#d1d5db'}
              />
              <Text className="text-xs" style={{ color: item.challenger_confirmed ? '#089166' : '#9ca3af' }}>
                Đối thủ xác nhận
              </Text>
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{ backgroundColor: '#2563eb' }}
            onPress={() => openStatusModal(item)}
          >
            <MaterialIcons name="swap-horiz" size={16} color="white" />
            <Text className="text-white text-sm font-bold">Đổi trạng thái</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl py-2.5"
            style={{ backgroundColor: '#ef4444' }}
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete" size={16} color="white" />
            <Text className="text-white text-sm font-bold">Xóa</Text>
          </TouchableOpacity>
        </View>
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
          Quản lý kèo đấu
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
            placeholder="Tìm theo tên chủ kèo, sân, SĐT..."
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

      {/* Field Filter Chips */}
      <View className="bg-white pb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          <TouchableOpacity
            className="rounded-full px-4 py-2"
            style={{
              backgroundColor: selectedFieldId === null ? '#089166' : '#f1f5f9',
            }}
            onPress={() => handleFieldSelect(null)}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: selectedFieldId === null ? 'white' : '#6b7280' }}
            >
              Tất cả sân
            </Text>
          </TouchableOpacity>
          {fields.map((field) => {
            const isActive = selectedFieldId === field.field_id
            return (
              <TouchableOpacity
                key={field.field_id}
                className="rounded-full px-4 py-2"
                style={{
                  backgroundColor: isActive ? '#089166' : '#f1f5f9',
                }}
                onPress={() => handleFieldSelect(field.field_id)}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isActive ? 'white' : '#6b7280' }}
                >
                  {field.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Status Filter Tabs */}
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

      {/* Matchings List */}
      <FlatList
        data={filteredMatchings}
        keyExtractor={(item) => String(item.matching_id)}
        renderItem={renderMatching}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialIcons name="groups" size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-base mt-3">
              {searchText.trim() ? 'Không tìm thấy kèo đấu' : 'Chưa có kèo đấu nào'}
            </Text>
          </View>
        }
      />

      {/* Detail Modal (slide-up) */}
      <Modal visible={detailVisible} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10" style={{ maxHeight: '80%' }}>
            {/* Modal header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-900">Chi tiết kèo đấu</Text>
              <TouchableOpacity onPress={() => { setDetailVisible(false); setSelectedMatching(null) }}>
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedMatching && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Status + Level */}
                <View className="flex-row items-center gap-2 mb-4">
                  {renderStatusBadge(selectedMatching.status)}
                  {renderLevelBadge(selectedMatching.level)}
                </View>

                {/* Field info */}
                {selectedMatching.field_name && (
                  <View className="bg-gray-50 rounded-xl p-4 mb-3">
                    <Text className="text-sm font-bold text-gray-900 mb-1">{selectedMatching.field_name}</Text>
                    {selectedMatching.field_address && (
                      <Text className="text-xs text-gray-500 mb-2">{selectedMatching.field_address}</Text>
                    )}
                  </View>
                )}

                {/* Date, Time, Duration */}
                <View className="bg-gray-50 rounded-xl p-4 mb-3">
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="event" size={14} color="#94a3b8" />
                      <Text className="text-xs text-gray-500">{selectedMatching.match_date}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="access-time" size={14} color="#94a3b8" />
                      <Text className="text-xs text-gray-500">{selectedMatching.start_time}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="timer" size={14} color="#94a3b8" />
                      <Text className="text-xs text-gray-500">{formatDuration(selectedMatching.duration)}</Text>
                    </View>
                  </View>
                </View>

                {/* Host info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-3">
                  <Text className="text-xs text-gray-400 mb-1">Chủ kèo</Text>
                  <View className="flex-row items-center gap-2 mb-1">
                    <MaterialIcons name="person" size={16} color="#94a3b8" />
                    <Text className="text-sm font-medium text-gray-900">{selectedMatching.host_name}</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="phone" size={16} color="#94a3b8" />
                    <Text className="text-sm text-gray-500">{selectedMatching.host_phone}</Text>
                  </View>
                </View>

                {/* Description */}
                {selectedMatching.description && (
                  <View className="bg-gray-50 rounded-xl p-4 mb-3">
                    <Text className="text-xs text-gray-400 mb-1">Mô tả</Text>
                    <Text className="text-sm text-gray-700">{selectedMatching.description}</Text>
                  </View>
                )}

                {/* Confirmation status */}
                {(selectedMatching.status === 'MATCHED' || selectedMatching.status === 'CONFIRMED') && (
                  <View className="bg-gray-50 rounded-xl p-4 mb-3">
                    <Text className="text-xs text-gray-400 mb-2">Trạng thái xác nhận</Text>
                    <View className="flex-row items-center gap-2 mb-1">
                      <MaterialIcons
                        name={selectedMatching.host_confirmed ? 'check-circle' : 'radio-button-unchecked'}
                        size={16}
                        color={selectedMatching.host_confirmed ? '#089166' : '#d1d5db'}
                      />
                      <Text className="text-sm" style={{ color: selectedMatching.host_confirmed ? '#089166' : '#9ca3af' }}>
                        Host đã xác nhận
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <MaterialIcons
                        name={selectedMatching.challenger_confirmed ? 'check-circle' : 'radio-button-unchecked'}
                        size={16}
                        color={selectedMatching.challenger_confirmed ? '#089166' : '#d1d5db'}
                      />
                      <Text className="text-sm" style={{ color: selectedMatching.challenger_confirmed ? '#089166' : '#9ca3af' }}>
                        Đối thủ đã xác nhận
                      </Text>
                    </View>
                  </View>
                )}

                {/* Cancellation reason */}
                {selectedMatching.status === 'CANCELLED' && selectedMatching.cancellation_reason && (
                  <View className="bg-red-50 rounded-xl p-4 mb-3">
                    <Text className="text-sm font-bold text-red-700 mb-1">Lý do hủy</Text>
                    <Text className="text-sm text-red-600">{selectedMatching.cancellation_reason}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Status Change Modal (centered) */}
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-2xl p-6 mx-6" style={{ width: '85%' }}>
            <Text className="text-lg font-bold text-gray-900 mb-2">Đổi trạng thái</Text>
            <Text className="text-sm text-gray-500 mb-4">
              Chọn trạng thái mới cho kèo #{statusChangeTarget?.matching_id}
            </Text>

            {ALL_STATUSES.filter((s) => s.status !== statusChangeTarget?.status).map((s) => (
              <TouchableOpacity
                key={s.status}
                className="flex-row items-center rounded-xl py-3 px-4 mb-2"
                style={{ backgroundColor: s.color + '15' }}
                onPress={() => handleStatusChange(s.status)}
                disabled={actionLoading}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color, marginRight: 12 }} />
                <Text className="text-sm font-bold" style={{ color: s.color }}>{s.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="items-center py-3 rounded-xl mt-2"
              style={{ backgroundColor: '#f1f5f9' }}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text className="text-sm font-bold text-gray-600">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
