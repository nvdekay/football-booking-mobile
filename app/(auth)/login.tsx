import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../src/context/AuthContext'

export default function LoginScreen() {
  const router = useRouter()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const onLogin = async () => {
    if (!email && !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu')
      return
    }
    try {
      setLoading(true)
      await auth.login({ email, password })
      router.replace('/(user)')
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', e?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center px-6">
        {/* Logo Section */}
        <View className="items-center mb-10">
          <View className="w-24 h-24 bg-[#10b981] rounded-3xl items-center justify-center shadow-md mb-5">
            <Ionicons name="football" size={48} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Đặt Sân Bóng</Text>
          <Text className="text-gray-500 text-base">Đăng nhập để tiếp tục</Text>
        </View>

        {/* Form Section */}
        <View className="space-y-4">
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
            <Text className="text-gray-900 font-semibold mb-2 text-base">Mật khẩu</Text>
            <View className="flex-row items-center border border-gray-200 rounded-xl px-4 h-14 bg-white">
              <View className="mr-3">
                <Ionicons name="lock-closed-outline" size={22} color="#9ca3af" />
              </View>
              <TextInput
                className="flex-1 text-gray-900 text-base"
                placeholder="........"
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

          {/* Options: Remember & Forgot Password */}
          <View className="flex-row justify-between items-center mt-2">
            <TouchableOpacity>
              <Text className="text-[#10b981] font-medium text-base">Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-[#10b981] h-14 rounded-xl items-center justify-center mt-6 shadow-sm"
            onPress={onLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Đăng nhập</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-gray-500 text-base">Chưa có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text className="text-[#10b981] font-bold text-base">Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
