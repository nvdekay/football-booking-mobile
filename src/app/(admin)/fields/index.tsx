import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { deleteField } from '../../../api/admin'
import { getFields } from '../../../api/field'
import { useAuth } from '../../../context/AuthContext'
import { Field } from '../../../types/field'

const FIELD_TYPE_LABEL: Record<string, string> = {
  '5': 'Sân 5',
  '7': 'Sân 7',
  '11': 'Sân 11',
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  READY_TO_BOOK: { label: 'Sẵn sàng', bg: '#089166', text: '#ffffff' },
  BOOKED: { label: 'Đã đặt', bg: '#f59e0b', text: '#ffffff' },
}

type FilterKey = 'ALL' | 'READY_TO_BOOK' | 'BOOKED'

export default function FieldsListScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL')
  const [showSearch, setShowSearch] = useState(false)
  const [searchText, setSearchText] = useState('')

  const fetchFields = async () => {
    try {
      const res = await getFields()
      setFields(res.data)
    } catch (err: any) {
      console.error('Fetch fields error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchFields()
    }, [])
  )

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      const res = await getFields()
      setFields(res.data)
    } catch (err: any) {
      console.error('Refresh fields error:', err.message)
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = (field: Field) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa "${field.name}"? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (!token) return
            try {
              await deleteField(field.field_id, token)
              Alert.alert('Thành công', 'Đã xóa sân.')
              fetchFields()
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa sân.')
            }
          },
        },
      ]
    )
  }

  // Compute filter counts from real data
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: fields.length }
    for (const f of fields) {
      counts[f.status] = (counts[f.status] || 0) + 1
    }
    return counts
  }, [fields])

  // Filter fields by status and search text
  const filteredFields = useMemo(() => {
    let result = fields
    if (activeFilter !== 'ALL') {
      result = result.filter((f) => f.status === activeFilter)
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase()
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(keyword) ||
          f.address.toLowerCase().includes(keyword)
      )
    }
    return result
  }, [fields, activeFilter, searchText])

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'READY_TO_BOOK', label: 'Sẵn sàng' },
    { key: 'BOOKED', label: 'Đã đặt' },
  ]

  const renderField = ({ item }: { item: Field }) => {
    const statusInfo = STATUS_CONFIG[item.status] || {
      label: item.status,
      bg: '#6b7280',
      text: '#ffffff',
    }
    const imageSource = item.image_url || item.thumbnail
    const isBooked = item.status === 'BOOKED'

    return (
      <View
        className="bg-white rounded-2xl overflow-hidden mb-4"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
          borderWidth: 1,
          borderColor: '#f1f5f9',
          opacity: isBooked ? 0.85 : 1,
        }}
      >
        {/* Image section */}
        <View className="h-44 bg-gray-200">
          {imageSource ? (
            <Image
              source={{ uri: imageSource }}
              className="w-full h-full"
              resizeMode="cover"
              style={isBooked ? { opacity: 0.6 } : undefined}
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-100">
              <MaterialIcons name="sports-soccer" size={48} color="#d1d5db" />
            </View>
          )}
          {/* Status badge */}
          <View
            className="absolute top-3 right-3 px-3 py-1 rounded-full"
            style={{ backgroundColor: statusInfo.bg }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: statusInfo.text }}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Content section */}
        <View className="p-4">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 mr-3">
              <Text
                className="text-base font-bold text-gray-900"
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <MaterialIcons name="groups" size={14} color="#94a3b8" />
                <Text className="text-sm text-gray-500">
                  {FIELD_TYPE_LABEL[item.type] || `Sân ${item.type} người`}
                </Text>
              </View>
            </View>
            {item.status === 'READY_TO_BOOK' && (
              <Text className="text-[#089166] font-bold text-sm">
                {Number(item.price_per_hour).toLocaleString('vi-VN')}đ/h
              </Text>
            )}
          </View>

          {item.address ? (
            <View className="flex-row items-center gap-1 mt-1 mb-3">
              <MaterialIcons name="location-on" size={12} color="#94a3b8" />
              <Text className="text-xs text-gray-400 flex-1" numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          ) : (
            <View className="mb-3" />
          )}

          {/* Action buttons */}
          <View
            className="flex-row gap-2 pt-3"
            style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9' }}
          >
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl"
              style={{ borderWidth: 1, borderColor: 'rgba(8,145,102,0.25)' }}
              onPress={() =>
                router.push(`/(admin)/fields/${item.field_id}/edit` as any)
              }
            >
              <MaterialIcons name="edit" size={16} color="#089166" />
              <Text className="text-sm font-semibold text-[#089166]">
                Chỉnh sửa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl"
              style={{ borderWidth: 1, borderColor: '#fecdd3' }}
              onPress={() => handleDelete(item)}
            >
              <MaterialIcons name="delete" size={16} color="#ef4444" />
              <Text className="text-sm font-semibold text-red-500">Xóa</Text>
            </TouchableOpacity>
          </View>

          {/* Pricing rules button */}
          <TouchableOpacity
            className="flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl mt-2 bg-gray-50"
            onPress={() =>
              router.push(`/(admin)/fields/${item.field_id}/pricing` as any)
            }
          >
            <MaterialIcons name="attach-money" size={16} color="#6b7280" />
            <Text className="text-sm font-medium text-gray-600">
              Quy tắc giá
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#089166" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="bg-white px-5 pt-4 pb-3"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(8,145,102,0.08)',
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="bg-[#089166]/10 p-2 rounded-lg">
              <MaterialIcons name="sports-soccer" size={22} color="#089166" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Danh sách sân bóng
            </Text>
          </View>
          <TouchableOpacity
            className="p-2 rounded-full"
            onPress={() => setShowSearch(!showSearch)}
          >
            <MaterialIcons
              name={showSearch ? 'close' : 'search'}
              size={24}
              color="#334155"
            />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        {showSearch && (
          <View className="mt-3 bg-gray-50 border border-gray-200 rounded-xl flex-row items-center px-3">
            <MaterialIcons name="search" size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 py-2.5 px-2 text-sm text-gray-900"
              placeholder="Tìm kiếm sân bóng..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <MaterialIcons name="close" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Filter chips */}
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row gap-2">
          {filters.map((filter) => {
            const count = statusCounts[filter.key] ?? 0
            const isActive = activeFilter === filter.key
            return (
              <TouchableOpacity
                key={filter.key}
                className={`px-4 py-2 rounded-full ${
                  isActive ? 'bg-[#089166]' : 'bg-gray-100'
                }`}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {filter.label} ({count})
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Field list */}
      <FlatList
        data={filteredFields}
        keyExtractor={(item) => String(item.field_id)}
        renderItem={renderField}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialIcons name="sports-soccer" size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-base mt-3">
              {searchText.trim()
                ? 'Không tìm thấy sân phù hợp'
                : 'Chưa có sân nào'}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-5 w-14 h-14 bg-[#089166] rounded-full items-center justify-center"
        style={{
          shadowColor: '#089166',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => router.push('/(admin)/fields/create')}
      >
        <MaterialIcons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </SafeAreaView>
  )
}
