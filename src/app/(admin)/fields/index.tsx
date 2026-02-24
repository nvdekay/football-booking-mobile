import { MaterialIcons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Text,
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

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Hoạt động', color: '#089166' },
  MAINTENANCE: { label: 'Bảo trì', color: '#d97706' },
  INACTIVE: { label: 'Ngưng', color: '#ef4444' },
}

export default function FieldsListScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

  const renderField = ({ item }: { item: Field }) => {
    const statusInfo = STATUS_LABEL[item.status] || { label: item.status, color: '#6b7280' }

    return (
      <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-3">
            <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
            <Text className="text-sm text-gray-500 mt-1" numberOfLines={1}>
              {item.address}
            </Text>
          </View>
          <View className="items-end gap-1">
            <View className="bg-emerald-50 px-2.5 py-0.5 rounded-full">
              <Text className="text-xs font-medium text-emerald-700">
                {FIELD_TYPE_LABEL[item.type] || `Sân ${item.type}`}
              </Text>
            </View>
            <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: statusInfo.color + '18' }}>
              <Text className="text-xs font-medium" style={{ color: statusInfo.color }}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-sm text-gray-700 mb-3">
          Sân #{item.field_number} · {Number(item.price_per_hour).toLocaleString('vi-VN')} ₫/giờ
        </Text>

        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 bg-gray-100 rounded-xl py-2.5 items-center"
            onPress={() => router.push(`/(admin)/fields/${item.field_id}/pricing`)}
          >
            <Text className="text-xs font-medium text-gray-700">Quy tắc giá</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-blue-50 rounded-xl py-2.5 items-center"
            onPress={() => router.push(`/(admin)/fields/${item.field_id}/edit`)}
          >
            <Text className="text-xs font-medium text-blue-700">Chỉnh sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-50 rounded-xl py-2.5 px-4 items-center"
            onPress={() => handleDelete(item)}
          >
            <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
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
      <View className="flex-row items-center justify-between px-6 pt-6 pb-3">
        <Text className="text-xl font-bold text-gray-900">Quản Lý Sân</Text>
        <TouchableOpacity
          className="bg-[#089166] px-4 py-2 rounded-xl flex-row items-center gap-1"
          onPress={() => router.push('/(admin)/fields/create')}
        >
          <MaterialIcons name="add" size={18} color="#fff" />
          <Text className="text-white text-sm font-semibold">Thêm sân</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={fields}
        keyExtractor={(item) => String(item.field_id)}
        renderItem={renderField}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialIcons name="sports-soccer" size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-base mt-3">Chưa có sân nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
