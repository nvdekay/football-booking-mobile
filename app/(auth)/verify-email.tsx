import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { resendVerification } from '../../src/api/auth'
import { useAuth } from '../../src/context/AuthContext'

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const auth = useAuth()
  const [code, setCode] = useState('')
  const email = (params.email as string) || ''
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const onVerify = async () => {
    if (!email || !code) {
      Alert.alert('Vui lòng nhập mã xác thực và đảm bảo email hợp lệ')
      return
    }
    try {
      setLoading(true)
      await auth.verifyEmail(email, code)
      Alert.alert('Xác thực thành công', 'Bạn có thể đăng nhập bây giờ')
      router.replace('/(auth)/login')
    } catch (e: any) {
      Alert.alert('Xác thực thất bại', e?.message || JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    if (!email) return Alert.alert('Email không hợp lệ')
    try {
      setResendLoading(true)
      await resendVerification(email)
      Alert.alert('Đã gửi lại mã', 'Vui lòng kiểm tra email của bạn')
    } catch (e: any) {
      Alert.alert('Gửi lại thất bại', e?.message || JSON.stringify(e))
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold text-green-700 mb-4">Xác thực Email</Text>
      <Text className="text-sm text-gray-600 mb-2">Mã 6 chữ số đã được gửi tới:</Text>
      <Text className="mb-4 font-medium">{email}</Text>

      <TextInput keyboardType="number-pad" className="border border-gray-200 rounded p-3 mb-4" value={code} onChangeText={setCode} placeholder="123456" />

      <TouchableOpacity className="bg-green-600 rounded py-3 items-center mb-3" onPress={onVerify} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-medium">Xác thực</Text>}
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <TouchableOpacity onPress={onResend} disabled={resendLoading}>
          {resendLoading ? <ActivityIndicator color="#16a34a" /> : <Text className="text-green-600">Gửi lại mã</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
