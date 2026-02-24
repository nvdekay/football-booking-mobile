import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
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
import { createPricingRule } from '../../../../api/admin'
import { getFieldById } from '../../../../api/field'
import { useAuth } from '../../../../context/AuthContext'
import { FieldDetail, PricingRule } from '../../../../types/field'

const DAYS = [
  { value: '1', label: 'T2' },
  { value: '2', label: 'T3' },
  { value: '3', label: 'T4' },
  { value: '4', label: 'T5' },
  { value: '5', label: 'T6' },
  { value: '6', label: 'T7' },
  { value: '0', label: 'CN' },
]

function parseDaysOfWeek(days: string): string {
  if (!days) return ''
  return days
    .split(',')
    .map((d) => {
      const found = DAYS.find((day) => day.value === d.trim())
      return found ? found.label : d
    })
    .join(', ')
}

export default function PricingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { token } = useAuth()

  const [field, setField] = useState<FieldDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [ruleName, setRuleName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [rulePrice, setRulePrice] = useState('')
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  const fetchField = useCallback(async () => {
    if (!id) return
    try {
      const res = await getFieldById(Number(id))
      setField(res.data)
    } catch (err: any) {
      console.error('Fetch field error:', err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchField()
  }, [fetchField])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchField()
    setRefreshing(false)
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  const resetForm = () => {
    setRuleName('')
    setStartTime('')
    setEndTime('')
    setRulePrice('')
    setSelectedDays(new Set())
  }

  const handleCreateRule = async () => {
    if (!ruleName.trim() || !startTime.trim() || !endTime.trim() || !rulePrice.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.')
      return
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime.trim()) || !timeRegex.test(endTime.trim())) {
      Alert.alert('Lỗi', 'Giờ phải đúng định dạng HH:mm (VD: 17:00)')
      return
    }

    const price = Number(rulePrice)
    if (isNaN(price) || price <= 0) {
      Alert.alert('Lỗi', 'Giá phải là số dương.')
      return
    }

    if (selectedDays.size === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một ngày áp dụng.')
      return
    }

    if (!token || !id) return

    try {
      setSubmitting(true)
      await createPricingRule(
        Number(id),
        {
          name: ruleName.trim(),
          start_time: startTime.trim(),
          end_time: endTime.trim(),
          price_per_hour: price,
          days_of_week: Array.from(selectedDays).sort().join(','),
        },
        token
      )
      Alert.alert('Thành công', 'Tạo quy tắc giá thành công!')
      resetForm()
      setShowForm(false)
      await fetchField()
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể tạo quy tắc giá.')
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Header */}
          <View className="flex-row items-center mb-5">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <MaterialIcons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>
                {field?.name || 'Giá theo khung giờ'}
              </Text>
              <Text className="text-sm text-gray-500">Quản lý quy tắc giá</Text>
            </View>
          </View>

          {/* Existing Pricing Rules */}
          {field?.pricing_rules && field.pricing_rules.length > 0 ? (
            <View className="mb-5">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                Quy tắc giá hiện có
              </Text>
              {field.pricing_rules.map((rule: PricingRule) => (
                <View key={rule.rule_id} className="bg-gray-50 rounded-2xl p-4 mb-2.5">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-sm font-semibold text-gray-900">{rule.name}</Text>
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        rule.is_active ? 'bg-emerald-50' : 'bg-gray-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          rule.is_active ? 'text-emerald-700' : 'text-gray-500'
                        }`}
                      >
                        {rule.is_active ? 'Đang hoạt động' : 'Tắt'}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-600">
                    {rule.start_time} – {rule.end_time}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {Number(rule.price_per_hour).toLocaleString('vi-VN')} ₫/giờ
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {parseDaysOfWeek(rule.days_of_week)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-10 mb-5">
              <MaterialIcons name="attach-money" size={40} color="#d1d5db" />
              <Text className="text-gray-400 text-sm mt-2">Chưa có quy tắc giá nào</Text>
            </View>
          )}

          {/* Toggle Form Button */}
          <TouchableOpacity
            className={`rounded-xl py-3 items-center mb-5 ${
              showForm ? 'bg-gray-200' : 'bg-[#089166]'
            }`}
            onPress={() => setShowForm(!showForm)}
          >
            <Text
              className={`font-semibold text-sm ${showForm ? 'text-gray-700' : 'text-white'}`}
            >
              {showForm ? 'Ẩn form' : 'Thêm quy tắc giá'}
            </Text>
          </TouchableOpacity>

          {/* Create Rule Form */}
          {showForm && (
            <View className="bg-gray-50 rounded-2xl p-4">
              <Text className="text-base font-semibold text-gray-900 mb-4">
                Tạo quy tắc giá mới
              </Text>

              <Text className="text-sm font-medium text-gray-700 mb-1.5">Tên quy tắc</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-3"
                placeholder="VD: Giờ cao điểm tối"
                value={ruleName}
                onChangeText={setRuleName}
              />

              <View className="flex-row gap-3 mb-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1.5">Giờ bắt đầu</Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="17:00"
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-1.5">Giờ kết thúc</Text>
                  <TextInput
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                    placeholder="21:00"
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>

              <Text className="text-sm font-medium text-gray-700 mb-1.5">Giá/giờ (₫)</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 mb-3"
                placeholder="VD: 400000"
                value={rulePrice}
                onChangeText={setRulePrice}
                keyboardType="numeric"
              />

              <Text className="text-sm font-medium text-gray-700 mb-1.5">Ngày áp dụng</Text>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      selectedDays.has(day.value)
                        ? 'bg-[#089166]'
                        : 'bg-white border border-gray-200'
                    }`}
                    onPress={() => toggleDay(day.value)}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        selectedDays.has(day.value) ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                className={`rounded-xl py-3.5 items-center ${
                  submitting ? 'bg-gray-300' : 'bg-[#089166]'
                }`}
                onPress={handleCreateRule}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">Lưu quy tắc</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
