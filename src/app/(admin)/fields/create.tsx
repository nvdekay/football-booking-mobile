import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { createField } from '../../../api/admin'
import { useAuth } from '../../../context/AuthContext'
import { FieldType } from '../../../types/field'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: '5', label: 'Sân 5' },
  { value: '7', label: 'Sân 7' },
  { value: '11', label: 'Sân 11' },
]

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Hoạt động' },
  { value: 'MAINTENANCE', label: 'Bảo trì' },
  { value: 'INACTIVE', label: 'Ngưng hoạt động' },
] as const

export default function CreateFieldScreen() {
  const router = useRouter()
  const { token } = useAuth()

  const [name, setName] = useState('')
  const [type, setType] = useState<FieldType>('5')
  const [address, setAddress] = useState('')
  const [fieldNumber, setFieldNumber] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'>('ACTIVE')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim() || !address.trim() || !pricePerHour.trim() || !fieldNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc.')
      return
    }

    const price = Number(pricePerHour)
    if (isNaN(price) || price <= 0) {
      Alert.alert('Lỗi', 'Giá/giờ phải là số dương.')
      return
    }

    const fieldNum = Number(fieldNumber)
    if (isNaN(fieldNum) || fieldNum <= 0 || !Number.isInteger(fieldNum)) {
      Alert.alert('Lỗi', 'Số sân phải là số nguyên dương.')
      return
    }

    if (!token) return

    try {
      setSubmitting(true)
      await createField(
        {
          name: name.trim(),
          type,
          address: address.trim(),
          price_per_hour: price,
          field_number: fieldNum,
          status,
          description: description.trim() || undefined,
          image_url: imageUrl.trim() || undefined,
        },
        token
      )
      Alert.alert('Thành công', 'Tạo sân mới thành công!', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo sân.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center mb-5">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <MaterialIcons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Thêm Sân Mới</Text>
          </View>

          {/* Tên sân */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Tên sân <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            placeholder="VD: Sân Bóng ABC"
            value={name}
            onChangeText={setName}
          />

          {/* Loại sân */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Loại sân</Text>
          <View className="flex-row gap-2 mb-4">
            {FIELD_TYPES.map((ft) => (
              <TouchableOpacity
                key={ft.value}
                className={`px-4 py-2.5 rounded-xl ${
                  type === ft.value ? 'bg-[#089166]' : 'bg-gray-100'
                }`}
                onPress={() => setType(ft.value)}
              >
                <Text
                  className={`text-sm font-medium ${
                    type === ft.value ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {ft.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Số sân */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Số sân <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            placeholder="VD: 1"
            value={fieldNumber}
            onChangeText={setFieldNumber}
            keyboardType="numeric"
          />

          {/* Địa chỉ */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Địa chỉ <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            placeholder="VD: 123 Nguyễn Văn A, Quận 1"
            value={address}
            onChangeText={setAddress}
          />

          {/* Giá/giờ */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Giá/giờ (₫) <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            placeholder="VD: 300000"
            value={pricePerHour}
            onChangeText={setPricePerHour}
            keyboardType="numeric"
          />

          {/* Trạng thái */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Trạng thái</Text>
          <View className="flex-row gap-2 mb-4">
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s.value}
                className={`px-3 py-2.5 rounded-xl ${
                  status === s.value ? 'bg-[#089166]' : 'bg-gray-100'
                }`}
                onPress={() => setStatus(s.value)}
              >
                <Text
                  className={`text-xs font-medium ${
                    status === s.value ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Mô tả */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">Mô tả</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            placeholder="Mô tả sân (tùy chọn)"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 80 }}
          />

          {/* URL hình ảnh */}
          <Text className="text-sm font-medium text-gray-700 mb-1.5">URL hình ảnh</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-6"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChangeText={setImageUrl}
            autoCapitalize="none"
          />

          <TouchableOpacity
            className={`rounded-xl py-3.5 items-center ${submitting ? 'bg-gray-300' : 'bg-[#089166]'}`}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Tạo sân</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
