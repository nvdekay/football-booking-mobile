import { MaterialIcons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useAuth } from '../../context/AuthContext'

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams()
  const router = useRouter()
  const auth = useAuth()

  const email = (params.email as string) || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<Array<TextInput | null>>([])

  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleBackspace = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const onVerify = async () => {
    Keyboard.dismiss()
    const code = otp.join('')
    if (code.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ 6 số xác thực')
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
    <View className="flex-1 bg-[#f5f8f7] dark:bg-[#10221c]">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable className="flex-1" onPress={Keyboard.dismiss}>
              {/* TopAppBar */}
              <View className="flex-row items-center p-4 pb-2 justify-between">
                <TouchableOpacity
                  className="flex size-12 shrink-0 items-center justify-center"
                  onPress={() => router.back()}
                >
                  <MaterialIcons name="arrow-back-ios" size={24} color="#111816" />
                </TouchableOpacity>
                <Text className="text-[#111816] dark:text-white text-lg font-bold leading-tight flex-1 text-center pr-12">
                  Xác thực OTP
                </Text>
              </View>

              <View className="flex flex-col items-center px-6 pt-8 pb-4 flex-1">
                {/* Icon */}
                <View className="mb-8 flex items-center justify-center w-32 h-32 rounded-full bg-[#0df2aa]/10 dark:bg-[#0df2aa]/20">
                  <View className="w-24 h-24 rounded-full bg-[#0df2aa] flex items-center justify-center">
                    <MaterialIcons name="verified-user" size={48} color="white" />
                  </View>
                </View>

                {/* HeadlineText */}
                <Text className="text-[#111816] dark:text-white text-2xl font-bold leading-tight text-center pb-2">
                  Xác thực danh tính
                </Text>

                {/* BodyText */}
                <Text className="text-[#608a7d] dark:text-gray-400 text-base font-normal leading-normal pb-8 text-center max-w-[300px]">
                  Vui lòng nhập mã OTP đã được gửi đến email của bạn
                </Text>

                {/* OTP Inputs */}
                <View className="flex-row justify-center w-full py-4 gap-3">
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { inputRefs.current[index] = ref }}
                      className={`flex h-14 w-12 rounded-lg bg-white dark:bg-[#1a332a] border-2 ${digit ? 'border-[#0df2aa]' : 'border-[#dbe6e2] dark:border-[#2d4d44]'} text-xl font-bold text-[#111816] dark:text-white`}
                      style={{ textAlign: 'center' }}
                      maxLength={1}
                      keyboardType="number-pad"
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index)}
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {/* Resend Link */}
                <View className="mt-8 items-center">
                  <Text className="text-sm text-[#608a7d] dark:text-gray-400">
                    Bạn chưa nhận được mã?
                  </Text>
                  <TouchableOpacity
                    className="mt-2 flex-row items-center justify-center gap-2"
                    onPress={onResend}
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      <ActivityIndicator size="small" color="#0df2aa" />
                    ) : (
                      <>
                        <MaterialIcons name="replay" size={20} color="#0df2aa" />
                        <Text className="text-[#0df2aa] font-semibold">Gửi lại mã</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View className="flex-grow" />

                {/* Verify Button */}
                <View className="w-full pb-6">
                  <TouchableOpacity
                    className="w-full bg-[#0df2aa] items-center justify-center py-4 px-6 rounded-xl shadow-lg"
                    onPress={onVerify}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#10221c" />
                    ) : (
                      <Text className="text-[#10221c] font-bold text-lg">Xác nhận</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}
