import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../src/context/AuthContext'

export default function LoginScreen() {
  const router = useRouter()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [phone_number, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onLogin = async () => {
    if (!password || (!email && !phone_number)) {
      Alert.alert('Vui lòng nhập email hoặc số điện thoại và mật khẩu')
      return
    }
    try {
      setLoading(true)
      await auth.login({ email: email || undefined, phone_number: phone_number || undefined, password })
      router.replace({ pathname: '/(user)' })
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', e?.message || JSON.stringify(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-green-700 mb-4">Đăng nhập</Text>

        <Text className="text-sm text-gray-600">Email</Text>
        <TextInput keyboardType="email-address" className="border border-gray-200 rounded p-3 mb-3" value={email} onChangeText={setEmail} placeholder="you@example.com" />

        <Text className="text-sm text-gray-600">Hoặc số điện thoại</Text>
        <TextInput keyboardType="phone-pad" className="border border-gray-200 rounded p-3 mb-3" value={phone_number} onChangeText={setPhoneNumber} placeholder="0917xxxxxx" />

        <Text className="text-sm text-gray-600">Mật khẩu</Text>
        <TextInput secureTextEntry className="border border-gray-200 rounded p-3 mb-6" value={password} onChangeText={setPassword} placeholder="•••••••" />

        <TouchableOpacity className="bg-green-600 rounded py-3 items-center" onPress={onLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-medium">Đăng nhập</Text>}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text>Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-green-600">Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
