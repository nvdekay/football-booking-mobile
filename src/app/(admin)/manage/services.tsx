import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
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
import { createService, deleteService, getServices } from '../../../api/admin'
import { useAuth } from '../../../context/AuthContext'
import { Service } from '../../../types/admin'

export default function ServicesScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchServices = async () => {
    try {
      const res = await getServices()
      setServices(res.data)
    } catch (err: any) {
      console.error('Fetch services error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchServices()
    setRefreshing(false)
  }

  const handleCreate = async () => {
    if (!name.trim() || !price.trim() || !unit.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }

    const priceNum = Number(price)
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Lỗi', 'Giá phải là số dương.')
      return
    }

    if (!token) return

    try {
      setSubmitting(true)
      await createService(
        {
          name: name.trim(),
          price: priceNum,
          unit: unit.trim(),
          image_url: imageUrl.trim() || undefined,
        },
        token
      )
      Alert.alert('Thành công', 'Tạo dịch vụ thành công!')
      setName('')
      setPrice('')
      setUnit('')
      setImageUrl('')
      setShowForm(false)
      await fetchServices()
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = (service: Service) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa dịch vụ "${service.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (!token) return
            try {
              await deleteService(service.service_id, token)
              Alert.alert('Thành công', 'Đã xóa dịch vụ.')
              fetchServices()
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa dịch vụ.')
            }
          },
        },
      ]
    )
  }

  const renderService = ({ item }: { item: Service }) => (
    <View className="bg-white border border-gray-100 rounded-2xl p-4 mb-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {Number(item.price).toLocaleString('vi-VN')} ₫/{item.unit}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-red-50 rounded-xl p-2.5"
          onPress={() => handleDelete(item)}
        >
          <MaterialIcons name="delete-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  )

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
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Dịch Vụ</Text>
        </View>
        <TouchableOpacity
          className={`px-4 py-2 rounded-xl ${showForm ? 'bg-gray-200' : 'bg-[#089166]'}`}
          onPress={() => setShowForm(!showForm)}
        >
          <Text className={`text-sm font-semibold ${showForm ? 'text-gray-700' : 'text-white'}`}>
            {showForm ? 'Ẩn' : 'Thêm'}
          </Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View className="mx-6 mb-3 bg-gray-50 rounded-2xl p-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Tên dịch vụ <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-3"
            placeholder="VD: Nước suối"
            value={name}
            onChangeText={setName}
          />

          <View className="flex-row gap-3 mb-3">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Giá (₫) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="10000"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">
                Đơn vị <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="chai"
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">URL hình ảnh</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            placeholder="https://..."
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
          />

          <TouchableOpacity
            className={`rounded-xl py-3 items-center ${submitting ? 'bg-gray-300' : 'bg-[#089166]'}`}
            onPress={handleCreate}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-sm">Tạo dịch vụ</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={services}
        keyExtractor={(item) => String(item.service_id)}
        renderItem={renderService}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialIcons name="room-service" size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-base mt-3">Chưa có dịch vụ nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
