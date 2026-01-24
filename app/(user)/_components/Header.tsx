import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';

interface HeaderProps {
  name?: string;
}

export const Header: React.FC<HeaderProps> = ({ name = 'Người dùng' }) => {
  const { user } = useAuth();
  const displayName = user?.full_name || name;

  return (
    <View className="flex-row justify-between items-center mb-6">
      <View className="flex-row items-center">
        <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mr-3">
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <Text className="text-green-700 font-semibold text-lg">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <View>
          <Text className="text-xs text-gray-600">Xin chào,</Text>
          <Text className="text-base font-semibold text-gray-900">
            {displayName}
          </Text>
          {user?.role && (
            <Text className="text-xs text-green-600 font-medium">
              {user.role}
            </Text>
          )}
        </View>
      </View>
      
      <View className="flex-row items-center">
        <TouchableOpacity className="mr-4">
          <Ionicons name="notifications-outline" size={24} color="#666666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
