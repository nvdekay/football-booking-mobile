import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../src/context/AuthContext'

export default function RegisterScreen() {
  const router = useRouter()
  const auth = useAuth()
  const [full_name, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone_number, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!full_name || !email || !password || !phone_number) {
      Alert.alert('Vui lòng nhập đầy đủ thông tin')
      return
    }
    try {
      setLoading(true)
      await auth.register({ full_name, email, password, phone_number })
      router.push({ pathname: '/(auth)/verify-email', params: { email } })
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', e?.message || JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-2xl font-bold text-green-700 mb-4">Tạo tài khoản</Text>

        <Text className="text-sm text-gray-600">Họ và tên</Text>
        <TextInput className="border border-gray-200 rounded p-3 mb-3" value={full_name} onChangeText={setFullName} placeholder="Nguyễn Vũ Đăng Khánh" />

        <Text className="text-sm text-gray-600">Email</Text>
        <TextInput keyboardType="email-address" className="border border-gray-200 rounded p-3 mb-3" value={email} onChangeText={setEmail} placeholder="you@example.com" />

        <Text className="text-sm text-gray-600">Số điện thoại</Text>
        <TextInput keyboardType="phone-pad" className="border border-gray-200 rounded p-3 mb-3" value={phone_number} onChangeText={setPhoneNumber} placeholder="0917xxxxxx" />

        <Text className="text-sm text-gray-600">Mật khẩu</Text>
        <TextInput secureTextEntry className="border border-gray-200 rounded p-3 mb-6" value={password} onChangeText={setPassword} placeholder="••••••••" />

        <TouchableOpacity className="bg-green-600 rounded py-3 items-center" onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-medium">Đăng ký</Text>}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text>Bạn đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-green-600">Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
