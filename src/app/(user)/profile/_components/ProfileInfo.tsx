import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../../../../types/auth';

interface ProfileInfoProps {
  user: User | null;
  onEdit?: () => void;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ user, onEdit }) => {
  const avatarUrl = user?.avatar_url;

  return (
    <View className="flex p-6 flex-col items-center gap-4">
      <View className="relative">
        <View className="w-28 h-28 rounded-full border-4 border-[#0df2aa]/20 overflow-hidden bg-[#e0f5ee] items-center justify-center">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={48} color="#089166" />
          )}
        </View>
        <TouchableOpacity onPress={onEdit} className="absolute bottom-0 right-0 bg-[#0df2aa] p-1.5 rounded-full border-2 border-white">
          <Ionicons name="pencil" size={12} color="#10221c" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-col items-center gap-1">
        <Text className="text-2xl font-bold tracking-tight text-[#111816]">
          {user?.full_name || 'Người dùng'}
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="bg-[#0df2aa]/20 px-3 py-0.5 rounded-full">
            <Text className="text-emerald-700 text-xs font-bold tracking-wider">
              {user?.role || 'NGƯỜI CHƠI'}
            </Text>
          </View>
          <Text className="text-slate-500 text-sm">• Thành viên từ 2023</Text>
        </View>
      </View>
    </View>
  );
};