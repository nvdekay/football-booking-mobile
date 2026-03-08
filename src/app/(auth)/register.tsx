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
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const onSubmit = async () => {
    if (!full_name || !email || !password || !phone_number) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin')
      return
    }
    if (!agreedToTerms) {
      Alert.alert('Lỗi', 'Vui lòng đồng ý với Điều khoản & Chính sách bảo mật')
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
    <View className="flex-1 bg-[#f5f8f7] dark:bg-[#10221c]">
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="relative flex w-full flex-col overflow-hidden pb-8">

            {/* TopAppBar */}
            <View className="flex-row items-center p-4 pb-2 justify-between">
              <TouchableOpacity
                className="flex size-12 shrink-0 items-center justify-center"
                onPress={() => router.back()}
              >
                <MaterialIcons name="arrow-back-ios" size={24} color="#111816" />
              </TouchableOpacity>
              <Text className="text-[#111816] dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-12">
                Đăng ký
              </Text>
            </View>

            <View className="flex flex-col px-4 pt-4">
              {/* HeadlineText */}
              <Text className="text-[#111816] dark:text-white text-[28px] font-bold leading-tight text-left pb-2 pt-4">
                Tham gia cộng đồng bóng đá
              </Text>

              {/* BodyText */}
              <Text className="text-[#608a7d] dark:text-[#0df2aa]/80 text-base font-normal leading-normal pb-6">
                Điền thông tin bên dưới để bắt đầu trải nghiệm đặt sân nhanh chóng.
              </Text>

              {/* Registration Form */}
              <View className="gap-1">
                {/* Full Name Field */}
                <View className="py-3">
                  <Text className="text-[#111816] dark:text-white text-sm font-medium leading-normal pb-2">
                    Họ và tên
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full rounded-xl text-[#111816] dark:text-white border border-[#dbe6e2] dark:border-[#2d4d44] bg-white dark:bg-[#1a332a] h-14 placeholder:text-[#608a7d] p-[15px] pl-12 text-base font-normal"
                      placeholder="Nhập tên đầy đủ của bạn"
                      placeholderTextColor="#608a7d"
                      value={full_name}
                      onChangeText={setFullName}
                    />
                    <View className="absolute left-4 top-0 bottom-0 justify-center">
                      <MaterialIcons name="person" size={24} color="#608a7d" />
                    </View>
                  </View>
                </View>

                {/* Email Field */}
                <View className="py-3">
                  <Text className="text-[#111816] dark:text-white text-sm font-medium leading-normal pb-2">
                    Email
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full rounded-xl text-[#111816] dark:text-white border border-[#dbe6e2] dark:border-[#2d4d44] bg-white dark:bg-[#1a332a] h-14 placeholder:text-[#608a7d] p-[15px] pl-12 text-base font-normal"
                      placeholder="example@email.com"
                      placeholderTextColor="#608a7d"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                      spellCheck={false}
                    />
                    <View className="absolute left-4 top-0 bottom-0 justify-center">
                      <MaterialIcons name="mail" size={24} color="#608a7d" />
                    </View>
                  </View>
                </View>

                {/* Phone Number Field */}
                <View className="py-3">
                  <Text className="text-[#111816] dark:text-white text-sm font-medium leading-normal pb-2">
                    Số điện thoại
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full rounded-xl text-[#111816] dark:text-white border border-[#dbe6e2] dark:border-[#2d4d44] bg-white dark:bg-[#1a332a] h-14 placeholder:text-[#608a7d] p-[15px] pl-12 text-base font-normal"
                      placeholder="090x xxx xxx"
                      placeholderTextColor="#608a7d"
                      value={phone_number}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                    <View className="absolute left-4 top-0 bottom-0 justify-center">
                      <MaterialIcons name="call" size={24} color="#608a7d" />
                    </View>
                  </View>
                </View>

                {/* Password Field */}
                <View className="py-3">
                  <Text className="text-[#111816] dark:text-white text-sm font-medium leading-normal pb-2">
                    Mật khẩu
                  </Text>
                  <View className="relative">
                    <TextInput
                      className="w-full rounded-xl text-[#111816] dark:text-white border border-[#dbe6e2] dark:border-[#2d4d44] bg-white dark:bg-[#1a332a] h-14 placeholder:text-[#608a7d] p-[15px] pl-12 pr-12 text-base font-normal"
                      placeholder="••••••••"
                      placeholderTextColor="#608a7d"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCorrect={false}
                      spellCheck={false}
                    />
                    <View className="absolute left-4 top-0 bottom-0 justify-center">
                      <MaterialIcons name="lock" size={24} color="#608a7d" />
                    </View>
                    <TouchableOpacity
                      className="absolute right-4 top-0 bottom-0 justify-center"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="#608a7d" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms and Conditions */}
                <TouchableOpacity
                  className="flex-row items-start gap-3 py-4"
                  activeOpacity={0.7}
                  onPress={() => setAgreedToTerms(!agreedToTerms)}
                >
                  <View className={`mt-1 h-5 w-5 rounded border items-center justify-center ${agreedToTerms ? 'bg-[#0df2aa] border-[#0df2aa]' : 'border-[#dbe6e2] dark:border-[#2d4d44] bg-white dark:bg-[#1a332a]'}`}>
                    {agreedToTerms && (
                      <MaterialIcons name="check" size={14} color="white" />
                    )}
                  </View>
                  <Text className="text-sm text-[#111816] dark:text-gray-300 leading-snug flex-1">
                    Tôi đồng ý với <Text className="text-[#0df2aa] font-semibold">Điều khoản & Điều kiện</Text> và <Text className="text-[#0df2aa] font-semibold">Chính sách bảo mật</Text> của ứng dụng.
                  </Text>
                </TouchableOpacity>

                {/* Register Button */}
                <View className="py-6">
                  <TouchableOpacity
                    className={`w-full h-14 rounded-xl shadow-lg items-center justify-center ${agreedToTerms ? 'bg-[#0df2aa]' : 'bg-[#0df2aa]/40'}`}
                    onPress={onSubmit}
                    disabled={loading || !agreedToTerms}
                  >
                    {loading ? (
                      <ActivityIndicator color="#10221c" />
                    ) : (
                      <Text className={`text-base font-bold ${agreedToTerms ? 'text-[#10221c]' : 'text-[#10221c]/50'}`}>Đăng ký</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Footer Link */}
                <View className="py-8 items-center">
                  <View className="flex-row">
                    <Text className="text-sm text-[#608a7d] dark:text-gray-400">
                      Bạn đã có tài khoản?{' '}
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                      <Text className="text-[#0df2aa] font-bold ml-1">Đăng nhập</Text>
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
