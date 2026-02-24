import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../context/AuthContext'

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

      // Navigation will be handled automatically by useProtectedRoute based on user role
      // No need to explicitly router.replace here
    } catch (e: any) {
      Alert.alert('Đăng nhập thất bại', e?.message || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 bg-[#f5f8f7] dark:bg-[#10221c]">
      <SafeAreaView className="flex-1">
        <View className="relative flex h-full w-full flex-col overflow-hidden">

          {/* TopAppBar */}
          <View className="flex-row items-center bg-transparent p-4 pb-2 justify-between">
            <TouchableOpacity
              className="flex size-12 shrink-0 items-center justify-center"
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back-ios" size={24} color="#111816" />
            </TouchableOpacity>
            <Text className="text-[#111816] dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-12">
              Đăng nhập
            </Text>
          </View>

          <View className="flex flex-col flex-1 px-4 pt-8 pb-10">
            {/* Header Image / Logo Section */}
            <View className="flex flex-col items-center justify-center mb-10">
              <View className="w-24 h-24 bg-[#0df2aa]/20 rounded-3xl flex items-center justify-center mb-6 border-2 border-[#0df2aa]/30">
                <MaterialIcons name="sports-soccer" size={60} color="#0df2aa" />
              </View>
              <Text className="text-2xl font-bold text-[#111816] dark:text-white">Chào mừng trở lại!</Text>
              <Text className="text-[#608a7d] text-sm mt-2">Đặt sân bóng ngay trong tầm tay</Text>
            </View>

            {/* Form Section */}
            <View className="space-y-4">
              {/* TextField: Email or Phone */}
              <View className="flex flex-col">
                <Text className="text-[#111816] dark:text-white text-base font-medium leading-normal pb-2">
                  Email hoặc Số điện thoại
                </Text>
                <TextInput
                  className="w-full min-w-0 resize-none overflow-hidden rounded-xl text-[#111816] dark:text-white border border-[#dbe6e2] dark:border-[#2d4d44] bg-white dark:bg-[#1a332a] h-14 placeholder:text-[#608a7d] p-[15px] text-base font-normal leading-normal"
                  placeholder="Nhập email hoặc số điện thoại"
                  placeholderTextColor="#608a7d"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  spellCheck={false}
                />
              </View>

              {/* TextField: Password */}
              <View className="flex flex-col">
                <Text className="text-[#111816] dark:text-white text-base font-medium leading-normal pb-2">
                  Mật khẩu
                </Text>
                <View className="flex-row w-full items-center rounded-xl border border-[#dbe6e2] dark:border-[#2d4d44] bg-white dark:bg-[#1a332a] h-14">
                  <TextInput
                    className="flex-1 min-w-0 resize-none overflow-hidden rounded-l-xl text-[#111816] dark:text-white border-none bg-transparent h-14 placeholder:text-[#608a7d] p-[15px] text-base font-normal leading-normal"
                    placeholder="Nhập mật khẩu"
                    placeholderTextColor="#608a7d"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCorrect={false}
                    spellCheck={false}
                  />
                  <TouchableOpacity
                    className="text-[#608a7d] flex items-center justify-center pr-[15px]"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#608a7d" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Primary Action Button */}
            <View className="mt-10">
              <TouchableOpacity
                className="w-full h-14 bg-[#0df2aa] rounded-xl shadow-lg items-center justify-center flex-row gap-2"
                onPress={onLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#10221c" />
                ) : (
                  <Text className="text-[#10221c] font-bold text-lg">Đăng nhập</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer Section */}
            <View className="mt-auto pt-10 items-center">
              <View className="flex-row">
                <Text className="text-[#608a7d] text-base">
                  Chưa có tài khoản?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text className="text-[#0df2aa] font-bold ml-1 underline">Đăng ký ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Optional background decoration */}
          <View className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none z-0">
            <MaterialIcons name="sports-soccer" size={300} color="#0df2aa" />
          </View>

        </View>
      </SafeAreaView>
    </View>
  )
}
