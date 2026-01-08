import { Feather, Ionicons } from '@expo/vector-icons'
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
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async () => {
    if (!full_name || !email || !password) {
      Alert.alert('Please fill in all fields')
      return
    }
    try {
      setLoading(true)
      await auth.register({ full_name, email, password, phone_number: '' }) // Assuming phone is optional or handled later
      router.push({ pathname: '/(auth)/verify-email', params: { email } })
    } catch (e: any) {
      Alert.alert('Registration failed', e?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">
        {/* Header */}
        <View className="items-center mb-10 mt-6">
          <View className="w-20 h-20 bg-white rounded-2xl items-center justify-center shadow-sm mb-6">
            <Ionicons name="football" size={40} color="#15803d" />
            <Text className="text-[10px] font-bold text-green-700 mt-1">FOOTBALL</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
          <Text className="text-gray-500 text-base">Sign up to get started</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-gray-900 font-medium mb-2 ml-1">Full Name</Text>
            <View className="flex-row items-center border border-gray-200 bg-white rounded-xl px-4 h-14">
              <Feather name="user" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 text-base"
                placeholder="John Doe"
                placeholderTextColor="#9ca3af"
                value={full_name}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View>
            <Text className="text-gray-900 font-medium mb-2 ml-1">Email</Text>
            <View className="flex-row items-center border border-gray-200 bg-white rounded-xl px-4 h-14">
              <Feather name="mail" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 text-base"
                placeholder="your@email.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View>
            <Text className="text-gray-900 font-medium mb-2 ml-1">Password</Text>
            <View className="flex-row items-center border border-gray-200 bg-white rounded-xl px-4 h-14">
              <Feather name="lock" size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-3 text-gray-900 text-base"
                placeholder="Create a password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            className="bg-green-700 h-14 rounded-full items-center justify-center mt-6 shadow-sm shadow-green-200"
            onPress={onSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-bold">Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8 mb-6">
          <Text className="text-gray-500 text-base">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-green-700 font-bold text-base">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
