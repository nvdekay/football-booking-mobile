import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number ?? '');
  const [saving, setSaving] = useState(false);

  const hasChanges =
    fullName.trim() !== (user?.full_name ?? '') ||
    phoneNumber.trim() !== (user?.phone_number ?? '');

  const isValid = fullName.trim().length > 0 && /^\d+$/.test(phoneNumber.trim());

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin. Tên không được trống và SĐT chỉ chứa số.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
      });
      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f5f8f7]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-slate-100">
          <TouchableOpacity onPress={() => router.back()} className="p-1 mr-3">
            <Ionicons name="arrow-back" size={24} color="#111816" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-[#111816]">Thông tin cá nhân</Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 20 }} keyboardShouldPersistTaps="handled">
          {/* Full Name */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-600">Họ và tên</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              className="bg-white px-4 py-3 rounded-xl text-base text-[#111816] border border-slate-200"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Email (read-only) */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-600">Email</Text>
            <TextInput
              value={user?.email ?? ''}
              editable={false}
              className="bg-slate-100 px-4 py-3 rounded-xl text-base text-slate-400 border border-slate-200"
            />
          </View>

          {/* Phone Number */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-slate-600">Số điện thoại</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
              className="bg-white px-4 py-3 rounded-xl text-base text-[#111816] border border-slate-200"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasChanges || !isValid || saving}
            className={`mt-4 py-3.5 rounded-xl items-center ${
              hasChanges && isValid && !saving ? 'bg-[#0df2aa]' : 'bg-slate-200'
            }`}
          >
            {saving ? (
              <ActivityIndicator color="#10221c" />
            ) : (
              <Text
                className={`text-base font-bold ${
                  hasChanges && isValid ? 'text-[#10221c]' : 'text-slate-400'
                }`}
              >
                Lưu thay đổi
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
