import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../context/AuthContext'

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const auth = useAuth()

  const email = (params.email as string) || ''
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const onVerify = async () => {
    if (!email || !code) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác thực và kiểm tra email')
      return
    }
    try {
      setLoading(true)
      await auth.verifyEmail(email, code)
      Alert.alert('Thành công', 'Tài khoản đã được kích hoạt', [
        { text: 'Đăng nhập ngay', onPress: () => router.replace('/(auth)/login') }
      ])
    } catch (e: any) {
      Alert.alert('Xác thực thất bại', e?.message || 'Mã xác thực không đúng hoặc đã hết hạn')
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    if (!email) return Alert.alert('Lỗi', 'Email không hợp lệ')
    try {
      setResendLoading(true)
      await auth.resendVerification(email)
      Alert.alert('Đã gửi lại mã', 'Vui lòng kiểm tra hộp thư email của bạn')
    } catch (e: any) {
      Alert.alert('Thất bại', e?.message || 'Không thể gửi lại mã')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} className="mb-8 w-10 h-10 items-center justify-center rounded-full bg-gray-50">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-[#10b981] rounded-full items-center justify-center shadow-lg shadow-green-200 mb-6">
            <Ionicons name="shield-checkmark" size={40} color="white" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">Xác thực Email</Text>
          <Text className="text-gray-500 text-center px-4">
            Mã OTP đã được gửi đến email{' '}
            <Text className="text-gray-900 font-semibold">{email}</Text>
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-6">
          <View>
            <Text className="text-gray-900 font-semibold mb-2 ml-1">Mã OTP</Text>
            <View className="flex-row items-center border-2 border-green-100 bg-green-50/30 rounded-2xl px-4 h-16">
              <Ionicons name="keypad-outline" size={24} color="#10b981" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 text-xl font-medium tracking-widest"
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                placeholderTextColor="#9ca3af"
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#10b981] h-14 rounded-xl items-center justify-center shadow-md shadow-green-200 mt-4"
            onPress={onVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Xác thực</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onResend}
            disabled={resendLoading}
            className="items-center py-4"
          >
            {resendLoading ? (
              <ActivityIndicator color="#10b981" size="small" />
            ) : (
              <Text className="text-gray-500 font-medium">
                Không nhận được mã? <Text className="text-[#10b981] font-bold">Gửi lại</Text>
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
