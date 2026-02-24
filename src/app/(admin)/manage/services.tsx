import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { createService, deleteService, getServicesAdmin, updateService } from '../../../api/admin'
import { useAuth } from '../../../context/AuthContext'
import { Service, ServiceStatus } from '../../../types/admin'

type FilterKey = 'ALL' | 'AVAILABLE' | 'UNAVAILABLE'

export default function ServicesScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL')
  const [searchText, setSearchText] = useState('')

  // Form state — shared for create & edit
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [formStatus, setFormStatus] = useState<ServiceStatus>('AVAILABLE')
  const [submitting, setSubmitting] = useState(false)

  const isEditMode = editingService !== null

  const resetForm = () => {
    setName('')
    setPrice('')
    setUnit('')
    setImageUrl('')
    setFormStatus('AVAILABLE')
    setEditingService(null)
    setShowForm(false)
  }

  const openCreateForm = () => {
    setEditingService(null)
    setName('')
    setPrice('')
    setUnit('')
    setImageUrl('')
    setFormStatus('AVAILABLE')
    setShowForm(true)
  }

  const openEditForm = (service: Service) => {
    setEditingService(service)
    setName(service.name)
    setPrice(String(service.price))
    setUnit(service.unit)
    setImageUrl(service.image_url || '')
    setFormStatus(service.status)
    setShowForm(true)
  }

  const fetchServices = async () => {
    if (!token) return
    try {
      const res = await getServicesAdmin(token)
      setServices(res.data)
    } catch (err: any) {
      console.error('Fetch services error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [token])

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
      resetForm()
      await fetchServices()
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo dịch vụ.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingService) return

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
      await updateService(
        editingService.service_id,
        {
          name: name.trim(),
          price: priceNum,
          unit: unit.trim(),
          image_url: imageUrl.trim() || undefined,
          status: formStatus,
        },
        token
      )
      Alert.alert('Thành công', 'Cập nhật dịch vụ thành công!')
      resetForm()
      await fetchServices()
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật dịch vụ.')
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
              if (editingService?.service_id === service.service_id) resetForm()
              fetchServices()
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể xóa dịch vụ.')
            }
          },
        },
      ]
    )
  }

  const handleToggleStatus = (service: Service) => {
    const newStatus: ServiceStatus = service.status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE'
    const label = newStatus === 'AVAILABLE' ? 'Đang bán' : 'Ngừng bán'
    Alert.alert(
      'Đổi trạng thái',
      `Chuyển "${service.name}" sang "${label}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            if (!token) return
            try {
              await updateService(service.service_id, { status: newStatus }, token)
              fetchServices()
            } catch (err: any) {
              Alert.alert('Lỗi', err.message || 'Không thể cập nhật trạng thái.')
            }
          },
        },
      ]
    )
  }

  const filteredServices = useMemo(() => {
    let result = services
    if (activeFilter === 'AVAILABLE') {
      result = result.filter((s) => s.status === 'AVAILABLE')
    } else if (activeFilter === 'UNAVAILABLE') {
      result = result.filter((s) => s.status !== 'AVAILABLE')
    }
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase()
      result = result.filter((s) => s.name.toLowerCase().includes(keyword))
    }
    return result
  }, [services, activeFilter, searchText])

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'AVAILABLE', label: 'Đang bán' },
    { key: 'UNAVAILABLE', label: 'Ngừng bán' },
  ]

  const renderService = ({ item }: { item: Service }) => {
    const isAvailable = item.status === 'AVAILABLE'
    const isSelected = editingService?.service_id === item.service_id

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openEditForm(item)}
        className="flex-row items-center gap-3 bg-white p-3 rounded-xl mb-3"
        style={{
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? '#0df2aa' : '#f8fafc',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
          opacity: isAvailable ? 1 : 0.7,
        }}
      >
        {/* Image */}
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            className="rounded-lg"
            style={{ width: 80, height: 80 }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="rounded-lg bg-gray-100 items-center justify-center"
            style={{ width: 80, height: 80 }}
          >
            <MaterialIcons name="inventory-2" size={28} color="#d1d5db" />
          </View>
        )}

        {/* Info */}
        <View className="flex-1 justify-between" style={{ height: 80, paddingVertical: 4 }}>
          <View>
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-sm font-medium mt-1" style={{ color: '#0df2aa' }}>
              {Number(item.price).toLocaleString('vi-VN')}đ/{item.unit}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-full"
              style={{
                width: 8,
                height: 8,
                backgroundColor: isAvailable ? '#0df2aa' : '#94a3b8',
              }}
            />
            <Text className="text-xs text-gray-400">
              {isAvailable ? 'Đang bán' : 'Ngừng bán'}
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="gap-2">
          <TouchableOpacity
            className="p-2"
            onPress={(e) => {
              e.stopPropagation()
              handleToggleStatus(item)
            }}
          >
            <MaterialIcons
              name={isAvailable ? 'pause-circle-outline' : 'play-circle-outline'}
              size={20}
              color={isAvailable ? '#f59e0b' : '#0df2aa'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2"
            onPress={(e) => {
              e.stopPropagation()
              handleDelete(item)
            }}
          >
            <MaterialIcons name="delete" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderFormContent = () => (
    <View className="mx-4 mb-3 bg-gray-50 rounded-2xl p-4">
      {/* Form header */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-bold text-gray-900">
          {isEditMode ? `Chỉnh sửa: ${editingService?.name}` : 'Thêm dịch vụ mới'}
        </Text>
        <TouchableOpacity onPress={resetForm}>
          <MaterialIcons name="close" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

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
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-3"
        placeholder="https://..."
        value={imageUrl}
        onChangeText={setImageUrl}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
      />

      {/* Status toggle — only in edit mode */}
      {isEditMode && (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Trạng thái</Text>
          <View className="flex-row gap-3">
            {([
              { value: 'AVAILABLE' as ServiceStatus, label: 'Đang bán', color: '#0df2aa' },
              { value: 'UNAVAILABLE' as ServiceStatus, label: 'Ngừng bán', color: '#94a3b8' },
            ]).map((opt) => {
              const selected = formStatus === opt.value
              return (
                <TouchableOpacity
                  key={opt.value}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl py-3"
                  style={{
                    borderWidth: 2,
                    borderColor: selected ? opt.color : '#e2e8f0',
                    backgroundColor: selected ? `${opt.color}18` : '#ffffff',
                  }}
                  onPress={() => setFormStatus(opt.value)}
                >
                  <View
                    className="rounded-full"
                    style={{ width: 8, height: 8, backgroundColor: opt.color }}
                  />
                  <Text
                    className="text-sm font-medium"
                    style={{ color: selected ? '#0f172a' : '#64748b' }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
      )}

      {/* Submit button */}
      <TouchableOpacity
        className="rounded-xl py-3 items-center"
        style={{ backgroundColor: submitting ? '#d1d5db' : '#0df2aa' }}
        onPress={isEditMode ? handleUpdate : handleCreate}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text className="font-bold text-sm" style={{ color: '#0f172a' }}>
            {isEditMode ? 'Cập nhật dịch vụ' : 'Tạo dịch vụ'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0df2aa" />
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
          Quản lý dịch vụ chi tiết
        </Text>
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: showForm && !isEditMode ? '#64748b' : '#0df2aa' }}
          onPress={() => {
            if (showForm && !isEditMode) {
              resetForm()
            } else {
              openCreateForm()
            }
          }}
        >
          <MaterialIcons
            name={showForm && !isEditMode ? 'close' : 'add'}
            size={24}
            color={showForm && !isEditMode ? '#ffffff' : '#0f172a'}
          />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View className="bg-white" style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
        <View className="flex-row px-4 gap-8">
          {filters.map((f) => {
            const isActive = activeFilter === f.key
            return (
              <TouchableOpacity
                key={f.key}
                className="pb-3 pt-4 px-1"
                style={{
                  borderBottomWidth: 3,
                  borderBottomColor: isActive ? '#0df2aa' : 'transparent',
                }}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text
                  className="text-sm font-bold"
                  style={{ color: isActive ? '#0f172a' : '#64748b' }}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-4">
        <View className="flex-row items-center h-12 rounded-xl bg-gray-100 overflow-hidden">
          <View className="pl-4">
            <MaterialIcons name="search" size={22} color="#64748b" />
          </View>
          <TextInput
            className="flex-1 px-3 text-base text-gray-900 h-full"
            placeholder="Tìm kiếm dịch vụ..."
            placeholderTextColor="#64748b"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />
          {searchText.length > 0 && (
            <TouchableOpacity className="pr-3" onPress={() => setSearchText('')}>
              <MaterialIcons name="close" size={18} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {showForm ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          >
            {renderFormContent()}
            {filteredServices.map((item) => (
              <View key={item.service_id} style={{ paddingHorizontal: 16 }}>
                {renderService({ item })}
              </View>
            ))}
            {filteredServices.length === 0 && (
              <View className="items-center justify-center py-20">
                <MaterialIcons name="inventory-2" size={48} color="#d1d5db" />
                <Text className="text-gray-400 text-base mt-3">
                  {searchText.trim() ? 'Không tìm thấy dịch vụ' : 'Chưa có dịch vụ nào'}
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={(item) => String(item.service_id)}
            renderItem={renderService}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View className="items-center justify-center py-20">
                <MaterialIcons name="inventory-2" size={48} color="#d1d5db" />
                <Text className="text-gray-400 text-base mt-3">
                  {searchText.trim() ? 'Không tìm thấy dịch vụ' : 'Chưa có dịch vụ nào'}
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
