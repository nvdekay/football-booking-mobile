import { Ionicons } from '@expo/vector-icons'
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
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async () => {
    if (!full_name || !email || !password || !phone_number) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin')
      return
    }
    try {
      setLoading(true)
      await auth.register({ full_name, email, password, phone_number })
      router.push({ pathname: '/(auth)/verify-email', params: { email } })
    } catch (e: any) {
      Alert.alert('Đăng ký thất bại', e?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">
        {/* Header */}
        <View className="items-center mb-10 mt-6">
          <View className="w-24 h-24 bg-[#10b981] rounded-3xl items-center justify-center shadow-md mb-5">
            <Ionicons name="football" size={48} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản</Text>
          <Text className="text-gray-500 text-base">Đăng ký để bắt đầu</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-900 font-semibold mb-2 text-base">Họ và tên</Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 h-14 bg-white">
              <View className="mr-3">
                <Ionicons name="person-outline" size={22} color="#9ca3af" />
              </View>
              <TextInput
                className="flex-1 text-gray-900 text-base"
                placeholder="Nguyễn Văn A"
                placeholderTextColor="#9ca3af"
                value={full_name}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View>
            <Text className="text-gray-900 font-semibold mb-2 text-base">Email</Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 h-14 bg-white">
              <View className="mr-3">
                <Ionicons name="mail-outline" size={22} color="#9ca3af" />
              </View>
              <TextInput
                className="flex-1 text-gray-900 text-base"
                placeholder="example@email.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View>
            <Text className="text-gray-900 font-semibold mb-2 text-base">Số điện thoại</Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 h-14 bg-white">
              <View className="mr-3">
                <Ionicons name="call-outline" size={22} color="#9ca3af" />
              </View>
              <TextInput
                className="flex-1 text-gray-900 text-base"
                placeholder="0912345678"
                placeholderTextColor="#9ca3af"
                value={phone_number}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View>
            <Text className="text-gray-900 font-semibold mb-2 text-base">Mật khẩu</Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 h-14 bg-white">
              <View className="mr-3">
                <Ionicons name="lock-closed-outline" size={22} color="#9ca3af" />
              </View>
              <TextInput
                className="flex-1 text-gray-900 text-base"
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-[#10b981] h-14 rounded-xl items-center justify-center mt-6 shadow-sm"
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8 mb-6">
          <Text className="text-gray-500 text-base">Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-[#10b981] font-bold text-base">Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
