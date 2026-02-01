import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../../../../types/auth';

interface ProfileHeaderProps {
  user: User | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  if (!user) return null;

  return (
    <View className="bg-white pt-6 pb-8 px-6 border-b border-gray-100">
      {/* Top actions */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold text-gray-900">Hồ sơ cá nhân</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="notifications-outline" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View className="items-center">
        {/* Avatar */}
        <View className="relative mb-4">
          {user.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              className="w-24 h-24 rounded-full"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center">
              <Text className="text-green-700 font-bold text-3xl">
                {user.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Edit avatar button */}
          <TouchableOpacity className="absolute bottom-0 right-0 bg-green-600 w-8 h-8 rounded-full items-center justify-center">
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {/* Name and Role */}
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          {user.full_name}
        </Text>

        <View className="flex-row items-center">
          <View
            className={`px-3 py-1 rounded-full ${user.role === 'ADMIN' ? 'bg-red-100' : 'bg-green-100'
              }`}
          >
            <Text
              className={`text-xs font-semibold ${user.role === 'ADMIN' ? 'text-red-700' : 'text-green-700'
                }`}
            >
              {user.role}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};