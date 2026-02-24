import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const ProfileHeader: React.FC = () => {
  return (
    <View className="flex-row items-center justify-between px-6 pt-2 pb-2 bg-white/80 sticky top-0 z-10">
      <Text className="text-xl font-bold tracking-tight text-[#111816]">Tài khoản</Text>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-[#f5f8f7]">
          <Ionicons name="settings-outline" size={20} color="#111816" />
        </TouchableOpacity>
      </View>
    </View>
  );
};