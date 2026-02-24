import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAuth } from '../../context/AuthContext'

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
    // Check Terms & Conditions logic would go here
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
    <View className="flex-1 bg-[#f5f8f7] dark:bg-[#10221c]">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="relative flex w-full flex-col overflow-hidden pb-8">

            {/* TopAppBar */}
            <View className="flex-row items-center p-4 pb-2 justify-between sticky top-0 z-10 bg-[#f5f8f7]/80 dark:bg-[#10221c]/80 backdrop-blur-md">
              <TouchableOpacity
                className="flex size-12 shrink-0 items-center justify-center"
                onPress={() => router.back()}
              >
                <MaterialIcons name="arrow-back-ios" size={24} color="#0d1c17" />
              </TouchableOpacity>
              <Text className="text-[#0d1c17] dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-12">
                Đăng ký
              </Text>
            </View>

            <View className="flex flex-col px-4 pt-4">
              {/* HeadlineText */}
              <Text className="text-[#0d1c17] dark:text-white text-[28px] font-bold leading-tight text-left pb-2 pt-4">
                Tham gia cộng đồng bóng đá
              </Text>

              {/* BodyText */}
              <Text className="text-[#499c82] dark:text-[#0bda99]/80 text-base font-normal leading-normal pb-6">
                Điền thông tin bên dưới để bắt đầu trải nghiệm đặt sân nhanh chóng.
              </Text>

              {/* Registration Form */}
              <View className="gap-1">
                {/* Full Name Field */}
                <View className="py-3">
                  <Text className="text-[#0d1c17] dark:text-white text-sm font-medium leading-normal pb-2">
                    Họ và tên
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full rounded-xl text-[#0d1c17] dark:text-white border border-[#cee8e0] dark:border-[#2a4d43] bg-white dark:bg-[#1a2e28] h-14 placeholder:text-[#499c82]/50 p-[15px] pl-12 text-base font-normal"
                      placeholder="Nhập tên đầy đủ của bạn"
                      placeholderTextColor="rgba(73, 156, 130, 0.5)"
                      value={full_name}
                      onChangeText={setFullName}
                    />
                    <View className="absolute left-4 top-0 bottom-0 justify-center">
                      <MaterialIcons name="person" size={24} color="#499c82" />
                    </View>
                  </View>
                </View>

                {/* Email Field */}
                <View className="py-3">
                  <Text className="text-[#0d1c17] dark:text-white text-sm font-medium leading-normal pb-2">
                    Email
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full rounded-xl text-[#0d1c17] dark:text-white border border-[#cee8e0] dark:border-[#2a4d43] bg-white dark:bg-[#1a2e28] h-14 placeholder:text-[#499c82]/50 p-[15px] pl-12 text-base font-normal"
                      placeholder="example@email.com"
                      placeholderTextColor="rgba(73, 156, 130, 0.5)"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      spellCheck={false}
                    />
                    <View className="absolute left-4 top-0 bottom-0 justify-center">
                      <MaterialIcons name="mail" size={24} color="#499c82" />
                    </View>
                  </View>
                </View>

                {/* Phone Number Field */}
                <View className="py-3">
                  <Text className="text-[#0d1c17] dark:text-white text-sm font-medium leading-normal pb-2">
                    Số điện thoại
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full rounded-xl text-[#0d1c17] dark:text-white border border-[#cee8e0] dark:border-[#2a4d43] bg-white dark:bg-[#1a2e28] h-14 placeholder:text-[#499c82]/50 p-[15px] pl-12 text-base font-normal"
                      placeholder="090x xxx xxx"
                      placeholderTextColor="rgba(73, 156, 130, 0.5)"
                      value={phone_number}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                    <View className="absolute left-4 top-0 bottom-0 justify-center">
                      <MaterialIcons name="call" size={24} color="#499c82" />
                    </View>
                  </View>
                </View>

                {/* Password Field */}
                <View className="py-3">
                  <Text className="text-[#0d1c17] dark:text-white text-sm font-medium leading-normal pb-2">
                    Mật khẩu
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full rounded-xl text-[#0d1c17] dark:text-white border border-[#cee8e0] dark:border-[#2a4d43] bg-white dark:bg-[#1a2e28] h-14 placeholder:text-[#499c82]/50 p-[15px] pl-12 pr-12 text-base font-normal"
                      placeholder="••••••••"
                      placeholderTextColor="rgba(73, 156, 130, 0.5)"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCorrect={false}
                      spellCheck={false}
                    />
                    <View className="absolute left-4 top-0 bottom-0 justify-center">
                      <MaterialIcons name="lock" size={24} color="#499c82" />
                    </View>
                    <TouchableOpacity
                      className="absolute right-4 top-0 bottom-0 justify-center"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons name="visibility" size={24} color="#499c82" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms and Conds */}
                <View className="flex-row items-start gap-3 py-4">
                  {/* Checkbox placeholder using View/Icon since standard Checkbox isn't native */}
                  <View className="mt-1 h-5 w-5 rounded border border-[#cee8e0] bg-white dark:bg-[#1a2e28] items-center justify-center">
                    {/* Logic for checkbox state would go here */}
                  </View>
                  <Text className="text-sm text-[#0d1c17] dark:text-gray-300 leading-snug flex-1">
                    Tôi đồng ý với <Text className="text-[#0bda99] font-semibold">Điều khoản & Điều kiện</Text> và <Text className="text-[#0bda99] font-semibold">Chính sách bảo mật</Text> của ứng dụng.
                  </Text>
                </View>

                {/* Register Button */}
                <View className="py-6">
                  <TouchableOpacity
                    className="w-full h-14 bg-[#0bda99] rounded-xl shadow-lg items-center justify-center"
                    onPress={onSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white text-base font-bold">Đăng ký</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Divider */}
                <View className="flex-row items-center gap-4 py-4">
                  <View className="h-[1px] flex-1 bg-[#cee8e0] dark:bg-[#2a4d43]" />
                  <Text className="text-xs text-[#499c82] uppercase tracking-widest font-medium">Hoặc</Text>
                  <View className="h-[1px] flex-1 bg-[#cee8e0] dark:bg-[#2a4d43]" />
                </View>

                {/* Social Register */}
                <View className="flex-row gap-4 py-2">
                  <TouchableOpacity className="flex-1 items-center justify-center h-14 border border-[#cee8e0] dark:border-[#2a4d43] rounded-xl bg-white dark:bg-[#1a2e28]">
                    {/* Placeholder for Google Icon */}
                    <MaterialIcons name="public" size={24} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 items-center justify-center h-14 border border-[#cee8e0] dark:border-[#2a4d43] rounded-xl bg-white dark:bg-[#1a2e28]">
                    {/* Placeholder for Facebook Icon */}
                    <MaterialIcons name="facebook" size={24} color="#4267B2" />
                  </TouchableOpacity>
                </View>

                {/* Footer Link */}
                <View className="py-8 items-center">
                  <View className="flex-row">
                    <Text className="text-sm text-[#499c82] dark:text-gray-400">
                      Bạn đã có tài khoản?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                      <Text className="text-[#0bda99] font-bold ml-1">Đăng nhập</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </View>
            </View>

            {/* Safe Area Spacer */}
            <View className="h-8" />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}
