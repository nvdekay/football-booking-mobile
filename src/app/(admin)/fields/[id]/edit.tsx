import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { FieldStatus, FieldType } from '../../../../types/field'

const FIELD_TYPES: { value: FieldType; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { value: '5', label: 'Sân 5 người', icon: 'groups' },
  { value: '7', label: 'Sân 7 người', icon: 'groups' },
  { value: '11', label: 'Sân 11 người', icon: 'groups' },
]

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
  const [status, setStatus] = useState<FieldStatus>('READY_TO_BOOK')
  const [originalStatus, setOriginalStatus] = useState<FieldStatus>('READY_TO_BOOK')
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
        setDescription(f.description || '')
        setImageUrl(f.image_url || '')
        const fieldStatus = (f.status as FieldStatus) || 'READY_TO_BOOK'
        setStatus(fieldStatus)
        setOriginalStatus(fieldStatus)
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
      const body: Parameters<typeof updateField>[1] = {
        name: name.trim(),
        type,
        address: address.trim(),
        price_per_hour: price,
        field_number: fieldNum,
        description: description.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      }
      // Only send status when user explicitly changed it
      if (status !== originalStatus) {
        body.status = status
      }
      await updateField(Number(id), body, token)
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
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#089166" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View
        className="bg-white px-4 py-3"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(8,145,102,0.08)',
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full"
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 flex-1 text-center pr-10">
            Cấu hình sân bóng
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tên sân bóng */}
          <View className="mb-8">
            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Tên sân bóng
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 text-base text-gray-900"
              style={{ height: 56 }}
              placeholder="Ví dụ: Sân cỏ nhân tạo Đại Nam 1"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Loại sân */}
          <View className="mb-8">
            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Loại sân bóng
            </Text>
            <View className="flex-row gap-3">
              {FIELD_TYPES.map((ft) => {
                const selected = type === ft.value
                return (
                  <TouchableOpacity
                    key={ft.value}
                    className="flex-1 items-center justify-center rounded-xl"
                    style={{
                      height: 56,
                      borderWidth: 2,
                      borderColor: selected ? '#089166' : '#e2e8f0',
                      backgroundColor: selected ? 'rgba(8,145,102,0.08)' : '#ffffff',
                    }}
                    onPress={() => setType(ft.value)}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons
                        name={ft.icon}
                        size={18}
                        color={selected ? '#089166' : '#64748b'}
                      />
                      <Text
                        className="text-sm font-medium"
                        style={{ color: selected ? '#089166' : '#1e293b' }}
                      >
                        {ft.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Số sân + Giá/giờ (2 columns) */}
          <View className="flex-row gap-4 mb-8">
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Số sân
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 text-base text-gray-900"
                style={{ height: 56 }}
                placeholder="VD: 1"
                placeholderTextColor="#94a3b8"
                value={fieldNumber}
                onChangeText={setFieldNumber}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Giá/giờ (₫)
              </Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 text-base text-gray-900"
                style={{ height: 56 }}
                placeholder="300000"
                placeholderTextColor="#94a3b8"
                value={pricePerHour}
                onChangeText={setPricePerHour}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Địa chỉ */}
          <View className="mb-8">
            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Địa chỉ
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 text-base text-gray-900"
              style={{ height: 56 }}
              placeholder="123 Nguyễn Văn A, Quận 1"
              placeholderTextColor="#94a3b8"
              value={address}
              onChangeText={setAddress}
            />
          </View>

          {/* Mô tả chi tiết */}
          <View className="mb-8">
            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Mô tả chi tiết
            </Text>
            <TextInput
              className="bg-white border border-gray-200 rounded-xl p-4 text-base text-gray-900"
              style={{ minHeight: 120 }}
              placeholder="Mô tả về chất lượng cỏ, hệ thống đèn, tiện ích đi kèm..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Hình ảnh sân bóng */}
          <View className="mb-8">
            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Hình ảnh sân bóng
            </Text>
            {imageUrl.trim() ? (
              <View className="flex-row gap-3 mb-3">
                <View
                  className="flex-1 rounded-xl overflow-hidden border border-gray-200"
                  style={{ aspectRatio: 16 / 9 }}
                >
                  <Image
                    source={{ uri: imageUrl.trim() }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <TouchableOpacity
                  className="flex-1 rounded-xl border-2 border-dashed border-gray-300 items-center justify-center"
                  style={{ aspectRatio: 16 / 9 }}
                  onPress={() => setImageUrl('')}
                >
                  <MaterialIcons name="add-a-photo" size={28} color="#94a3b8" />
                  <Text className="text-xs text-gray-500 mt-1">Đổi ảnh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                className="rounded-xl border-2 border-dashed border-gray-300 items-center justify-center"
                style={{ height: 100 }}
              >
                <MaterialIcons name="add-a-photo" size={28} color="#94a3b8" />
                <Text className="text-xs text-gray-500 mt-1">Chưa có hình ảnh</Text>
              </View>
            )}
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 text-sm text-gray-900 mt-3"
              style={{ height: 48 }}
              placeholder="Nhập URL hình ảnh..."
              placeholderTextColor="#94a3b8"
              value={imageUrl}
              onChangeText={setImageUrl}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          {/* Trạng thái */}
          <View className="mb-8">
            <Text className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Trạng thái
            </Text>
            <View className="flex-row gap-3">
              {([
                { value: 'READY_TO_BOOK' as FieldStatus, label: 'Sẵn sàng đặt', icon: 'check-circle' as const, color: '#089166' },
                { value: 'BOOKED' as FieldStatus, label: 'Đã đặt', icon: 'event-busy' as const, color: '#f59e0b' },
              ]).map((opt) => {
                const selected = status === opt.value
                return (
                  <TouchableOpacity
                    key={opt.value}
                    className="flex-1 items-center justify-center rounded-xl"
                    style={{
                      height: 56,
                      borderWidth: 2,
                      borderColor: selected ? opt.color : '#e2e8f0',
                      backgroundColor: selected ? `${opt.color}14` : '#ffffff',
                    }}
                    onPress={() => setStatus(opt.value)}
                  >
                    <View className="flex-row items-center gap-1.5">
                      <MaterialIcons
                        name={opt.icon}
                        size={18}
                        color={selected ? opt.color : '#64748b'}
                      />
                      <Text
                        className="text-sm font-medium"
                        style={{ color: selected ? opt.color : '#1e293b' }}
                      >
                        {opt.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>

          {/* Save button */}
          <View className="pt-4 pb-4">
            <TouchableOpacity
              className="w-full rounded-xl flex-row items-center justify-center gap-2"
              style={{
                height: 60,
                backgroundColor: submitting ? '#d1d5db' : '#089166',
                shadowColor: '#089166',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="save" size={22} color="#ffffff" />
                  <Text className="text-white font-bold text-lg">Lưu thay đổi</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="w-full items-center justify-center mt-4"
              style={{ height: 48 }}
              onPress={() => router.back()}
            >
              <Text className="text-gray-500 font-medium text-base">
                Hủy bỏ và quay lại
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
