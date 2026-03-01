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
  OPEN: { label: 'Đang mở', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  MATCHED: { label: 'Đã ghép', color: '#d97706', bg: '#fef3c7' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#059669', bg: '#d1fae5' },
  COMPLETED: { label: 'Hoàn thành', color: '#0891b2', bg: '#cffafe' },
  CANCELLED: { label: 'Đã hủy', color: '#e11d48', bg: '#ffe4e6' },
  EXPIRED: { label: 'Hết hạn', color: '#64748b', bg: '#f1f5f9' },
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  VUI_VE: { label: 'Vui vẻ', color: '#475569', bg: '#f1f5f9' },
  BAN_CHUYEN: { label: 'Bán chuyên', color: '#475569', bg: '#f1f5f9' },
  CHUYEN_NGHIEP: { label: 'Chuyên nghiệp', color: '#475569', bg: '#f1f5f9' },
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
  { status: 'OPEN', label: 'Đang mở', color: '#10B981' },
  { status: 'MATCHED', label: 'Đã ghép', color: '#d97706' },
  { status: 'CONFIRMED', label: 'Đã xác nhận', color: '#059669' },
  { status: 'COMPLETED', label: 'Hoàn thành', color: '#0891b2' },
  { status: 'CANCELLED', label: 'Đã hủy', color: '#e11d48' },
  { status: 'EXPIRED', label: 'Hết hạn', color: '#64748b' },
]

const DAYS_VI = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

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

  const fetchMatchings = async (currentFieldId: number | null, authToken: string) => {
    try {
      const filters: any = { limit: 100 }
      if (currentFieldId) filters.field_id = currentFieldId
      const res = await getAllMatchingsAdmin(filters, authToken)
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
    if (!token) return
    setLoading(true)
    fetchMatchings(selectedFieldId, token)
  }, [token, selectedFieldId])

  const onRefresh = async () => {
    if (!token) return
    setRefreshing(true)
    await fetchMatchings(selectedFieldId, token)
    setRefreshing(false)
  }

  const handleFieldSelect = (fieldId: number | null) => {
    setSelectedFieldId(fieldId)
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
              fetchMatchings(selectedFieldId, token)
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
              fetchMatchings(selectedFieldId, token)
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

  // === Display helpers ===

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      return m > 0 ? `${h}h${m}p` : `${h}h`
    }
    return `${minutes}p`
  }

  const formatTime = (time: string) => time.substring(0, 5)

  const computeEndTime = (startTime: string, durationMinutes: number) => {
    const parts = startTime.split(':')
    const h = parseInt(parts[0])
    const m = parseInt(parts[1])
    const totalMin = h * 60 + m + durationMinutes
    const endH = Math.floor(totalMin / 60) % 24
    const endM = totalMin % 60
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    const dayName = DAYS_VI[date.getDay()]
    const dd = date.getDate().toString().padStart(2, '0')
    const mm = (date.getMonth() + 1).toString().padStart(2, '0')
    return `${dayName}, ${dd}/${mm}`
  }

  // === Render helpers ===

  const renderStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || { label: status, color: '#64748b', bg: '#f1f5f9' }
    return (
      <View style={{ backgroundColor: config.bg, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
        <Text style={{ color: config.color, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
          {config.label}
        </Text>
      </View>
    )
  }

  const renderLevelBadge = (level: string) => {
    const config = LEVEL_CONFIG[level] || { label: level, color: '#475569', bg: '#f1f5f9' }
    return (
      <View style={{ backgroundColor: config.bg, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
        <Text style={{ color: config.color, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
          {config.label}
        </Text>
      </View>
    )
  }

  const renderMatching = ({ item }: { item: AdminTeamMatching }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openDetail(item)}
        className="bg-white rounded-xl p-4 mb-4"
        style={{
          borderWidth: 1,
          borderColor: '#f1f5f9',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {/* Row 1: Badges + ID */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row flex-wrap gap-2">
            {renderStatusBadge(item.status)}
            {renderLevelBadge(item.level)}
          </View>
          <Text style={{ fontSize: 12, color: '#94a3b8' }}>ID: #{item.matching_id}</Text>
        </View>

        {/* Field name */}
        {item.field_name && (
          <Text className="font-bold text-base mb-1" style={{ color: '#0f172a' }} numberOfLines={1}>
            {item.field_name}
          </Text>
        )}

        {/* Location */}
        {item.field_address && (
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="location-on" size={14} color="#64748b" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: '#64748b' }} numberOfLines={1} className="flex-1">
              {item.field_address}
            </Text>
          </View>
        )}

        {/* Time / Date grid */}
        <View
          className="flex-row mb-4 p-3 rounded-lg"
          style={{ backgroundColor: '#f8fafc', gap: 16 }}
        >
          <View className="flex-1" style={{ gap: 4 }}>
            <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
              Thời gian
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
              {formatTime(item.start_time)} - {computeEndTime(item.start_time, item.duration)}
            </Text>
          </View>
          <View className="flex-1" style={{ gap: 4 }}>
            <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
              Ngày
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
              {formatDate(item.match_date)}
            </Text>
          </View>
        </View>

        {/* Host info */}
        <View className="flex-row items-center mb-4" style={{ gap: 12 }}>
          <View
            className="items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.2)' }}
          >
            <MaterialIcons name="person" size={22} color="#10B981" />
          </View>
          <View>
            <Text style={{ fontSize: 12, color: '#94a3b8' }}>Chủ kèo</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>
              {item.host_name}
              <Text style={{ fontWeight: '400', color: '#94a3b8' }}> | {item.host_phone}</Text>
            </Text>
          </View>
        </View>

        {/* Confirmation indicators when MATCHED */}
        {item.status === 'MATCHED' && (
          <View className="flex-row items-center mb-3" style={{ gap: 12 }}>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <MaterialIcons
                name={item.host_confirmed ? 'check-circle' : 'radio-button-unchecked'}
                size={14}
                color={item.host_confirmed ? '#10B981' : '#d1d5db'}
              />
              <Text style={{ fontSize: 12, color: item.host_confirmed ? '#10B981' : '#94a3b8' }}>
                Host xác nhận
              </Text>
            </View>
            <View className="flex-row items-center" style={{ gap: 4 }}>
              <MaterialIcons
                name={item.challenger_confirmed ? 'check-circle' : 'radio-button-unchecked'}
                size={14}
                color={item.challenger_confirmed ? '#10B981' : '#d1d5db'}
              />
              <Text style={{ fontSize: 12, color: item.challenger_confirmed ? '#10B981' : '#94a3b8' }}>
                Đối thủ xác nhận
              </Text>
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View className="flex-row pt-3" style={{ gap: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' }}>
          <TouchableOpacity
            className="flex-1 items-center justify-center rounded-lg py-2 px-4"
            style={{ borderWidth: 1, borderColor: '#10B981' }}
            onPress={() => openStatusModal(item)}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#10B981' }}>Đổi trạng thái</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="items-center justify-center rounded-lg py-2 px-4"
            onPress={() => handleDelete(item)}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#f43f5e' }}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white" style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        {/* Title row */}
        <View className="flex-row items-center p-4">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#475569" />
          </TouchableOpacity>
          <Text className="flex-1 text-center" style={{ fontSize: 20, fontWeight: '700', color: '#0f172a', letterSpacing: -0.3 }}>
            Quản lý kèo đấu
          </Text>
          <View className="w-10 h-10" />
        </View>

        {/* Search Bar */}
        <View className="px-4 pb-4">
          <View
            className="flex-row items-center rounded-xl overflow-hidden"
            style={{ backgroundColor: '#f1f5f9', height: 48 }}
          >
            <View className="pl-3">
              <MaterialIcons name="search" size={22} color="#94a3b8" />
            </View>
            <TextInput
              className="flex-1 px-3 h-full"
              style={{ fontSize: 14, color: '#0f172a' }}
              placeholder="Tìm tên chủ kèo, sân, hoặc SĐT"
              placeholderTextColor="#64748b"
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
        <View className="pb-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          >
            <TouchableOpacity
              className="rounded-full px-4 py-2"
              style={{
                backgroundColor: selectedFieldId === null ? '#10B981' : '#f1f5f9',
                ...(selectedFieldId === null
                  ? { shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }
                  : {}),
              }}
              onPress={() => handleFieldSelect(null)}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: selectedFieldId === null ? '600' : '500',
                  color: selectedFieldId === null ? '#ffffff' : '#475569',
                }}
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
                    backgroundColor: isActive ? '#10B981' : '#f1f5f9',
                    ...(isActive
                      ? { shadowColor: '#10B981', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 }
                      : {}),
                  }}
                  onPress={() => handleFieldSelect(field.field_id)}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isActive ? '600' : '500',
                      color: isActive ? '#ffffff' : '#475569',
                    }}
                  >
                    {field.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Status Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key
            return (
              <TouchableOpacity
                key={f.key}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? '#10B981' : 'transparent',
                }}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#10B981' : '#64748b',
                  }}
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
        style={{ backgroundColor: '#f8fafc' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialIcons name="groups" size={48} color="#cbd5e1" />
            <Text style={{ color: '#94a3b8', fontSize: 16, marginTop: 12 }}>
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
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>Chi tiết kèo đấu</Text>
              <TouchableOpacity onPress={() => { setDetailVisible(false); setSelectedMatching(null) }}>
                <MaterialIcons name="close" size={24} color="#64748b" />
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
                  <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#f8fafc' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>
                      {selectedMatching.field_name}
                    </Text>
                    {selectedMatching.field_address && (
                      <View className="flex-row items-center">
                        <MaterialIcons name="location-on" size={14} color="#64748b" style={{ marginRight: 4 }} />
                        <Text style={{ fontSize: 12, color: '#64748b' }}>{selectedMatching.field_address}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Date, Time, Duration */}
                <View className="rounded-xl p-4 mb-3 flex-row" style={{ backgroundColor: '#f8fafc', gap: 16 }}>
                  <View className="flex-1" style={{ gap: 4 }}>
                    <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                      Thời gian
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
                      {formatTime(selectedMatching.start_time)} - {computeEndTime(selectedMatching.start_time, selectedMatching.duration)}
                    </Text>
                  </View>
                  <View className="flex-1" style={{ gap: 4 }}>
                    <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                      Ngày
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
                      {formatDate(selectedMatching.match_date)}
                    </Text>
                  </View>
                  <View style={{ gap: 4 }}>
                    <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                      Thời lượng
                    </Text>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#0f172a' }}>
                      {formatDuration(selectedMatching.duration)}
                    </Text>
                  </View>
                </View>

                {/* Host info */}
                <View className="rounded-xl p-4 mb-3 flex-row items-center" style={{ backgroundColor: '#f8fafc', gap: 12 }}>
                  <View
                    className="items-center justify-center"
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(16,185,129,0.2)' }}
                  >
                    <MaterialIcons name="person" size={22} color="#10B981" />
                  </View>
                  <View>
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>Chủ kèo</Text>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0f172a' }}>
                      {selectedMatching.host_name}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#64748b' }}>{selectedMatching.host_phone}</Text>
                  </View>
                </View>

                {/* Description */}
                {selectedMatching.description && (
                  <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#f8fafc' }}>
                    <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 }}>
                      Mô tả
                    </Text>
                    <Text style={{ fontSize: 14, color: '#334155' }}>{selectedMatching.description}</Text>
                  </View>
                )}

                {/* Confirmation status */}
                {(selectedMatching.status === 'MATCHED' || selectedMatching.status === 'CONFIRMED') && (
                  <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#f8fafc' }}>
                    <Text style={{ fontSize: 10, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', marginBottom: 8 }}>
                      Trạng thái xác nhận
                    </Text>
                    <View className="flex-row items-center mb-1" style={{ gap: 8 }}>
                      <MaterialIcons
                        name={selectedMatching.host_confirmed ? 'check-circle' : 'radio-button-unchecked'}
                        size={16}
                        color={selectedMatching.host_confirmed ? '#10B981' : '#d1d5db'}
                      />
                      <Text style={{ fontSize: 14, color: selectedMatching.host_confirmed ? '#10B981' : '#94a3b8' }}>
                        Host đã xác nhận
                      </Text>
                    </View>
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <MaterialIcons
                        name={selectedMatching.challenger_confirmed ? 'check-circle' : 'radio-button-unchecked'}
                        size={16}
                        color={selectedMatching.challenger_confirmed ? '#10B981' : '#d1d5db'}
                      />
                      <Text style={{ fontSize: 14, color: selectedMatching.challenger_confirmed ? '#10B981' : '#94a3b8' }}>
                        Đối thủ đã xác nhận
                      </Text>
                    </View>
                  </View>
                )}

                {/* Cancellation reason */}
                {selectedMatching.status === 'CANCELLED' && selectedMatching.cancellation_reason && (
                  <View className="rounded-xl p-4 mb-3" style={{ backgroundColor: '#fff1f2' }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#be123c', marginBottom: 4 }}>Lý do hủy</Text>
                    <Text style={{ fontSize: 14, color: '#e11d48' }}>{selectedMatching.cancellation_reason}</Text>
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
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>Đổi trạng thái</Text>
            <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 16 }}>
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
                <Text style={{ fontSize: 14, fontWeight: '700', color: s.color }}>{s.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="items-center py-3 rounded-xl mt-2"
              style={{ backgroundColor: '#f1f5f9' }}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#475569' }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
