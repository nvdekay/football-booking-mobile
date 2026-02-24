import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
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
import { updateField } from '../../../../api/admin'
import { getFieldById } from '../../../../api/field'
import { useAuth } from '../../../../context/AuthContext'
import { FieldType } from '../../../../types/field'

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

export default function EditFieldScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { token } = useAuth()

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [type, setType] = useState<FieldType>('5')
  const [address, setAddress] = useState('')
  const [fieldNumber, setFieldNumber] = useState('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'>('ACTIVE')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await getFieldById(Number(id))
        const f = res.data
        setName(f.name)
        setType(f.type)
        setAddress(f.address)
        setFieldNumber(String(f.field_number))
        setPricePerHour(String(f.price_per_hour))
        setStatus((f.status as any) || 'ACTIVE')
        setDescription(f.description || '')
        setImageUrl(f.image_url || '')
      } catch (err: any) {
        Alert.alert('Lỗi', 'Không thể tải thông tin sân.')
        router.back()
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

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

    if (!token || !id) return

    try {
      setSubmitting(true)
      await updateField(
        Number(id),
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
      Alert.alert('Thành công', 'Cập nhật sân thành công!', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể cập nhật sân.')
    } finally {
      setSubmitting(false)
    }
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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center mb-5">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <MaterialIcons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Chỉnh Sửa Sân</Text>
          </View>

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Tên sân <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            value={name}
            onChangeText={setName}
          />

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

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Số sân <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            value={fieldNumber}
            onChangeText={setFieldNumber}
            keyboardType="numeric"
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Địa chỉ <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            value={address}
            onChangeText={setAddress}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">
            Giá/giờ (₫) <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            value={pricePerHour}
            onChangeText={setPricePerHour}
            keyboardType="numeric"
          />

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

          <Text className="text-sm font-medium text-gray-700 mb-1.5">Mô tả</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-4"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 80 }}
          />

          <Text className="text-sm font-medium text-gray-700 mb-1.5">URL hình ảnh</Text>
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-6"
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
              <Text className="text-white font-semibold text-base">Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
