import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { User } from '../../../../types/auth';

interface ProfileInfoProps {
  user: User | null;
}

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  iconColor?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  label,
  value,
  iconColor = "#666666"
}) => (
  <View className="flex-row items-center py-4 border-b border-gray-50">
    <View className="w-10">
      <Ionicons name={icon as any} size={20} color={iconColor} />
    </View>
    <View className="flex-1 ml-3">
      <Text className="text-sm text-gray-500 mb-1">{label}</Text>
      <Text className="text-base font-medium text-gray-900">{value}</Text>
    </View>
  </View>
);

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ user }) => {
  if (!user) return null;

  return (
    <View className="bg-white mx-4 my-4 rounded-xl p-4 shadow-sm">
      <Text className="text-lg font-semibold text-gray-900 mb-4">
        Thông tin cá nhân
      </Text>

      <InfoRow
        icon="person-outline"
        label="Họ và tên"
        value={user.full_name}
        iconColor="#16a34a"
      />

      <InfoRow
        icon="mail-outline"
        label="Email"
        value={user.email}
        iconColor="#3b82f6"
      />

      <InfoRow
        icon="call-outline"
        label="Số điện thoại"
        value={user.phone_number}
        iconColor="#f59e0b"
      />

      <InfoRow
        icon="shield-outline"
        label="Vai trò"
        value={user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}
        iconColor={user.role === 'ADMIN' ? '#ef4444' : '#16a34a'}
      />

      <View className="flex-row items-center py-4">
        <View className="w-10">
          <Ionicons name="finger-print-outline" size={20} color="#8b5cf6" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-sm text-gray-500 mb-1">ID người dùng</Text>
          <Text className="text-base font-medium text-gray-900">#{user.id}</Text>
        </View>
      </View>
    </View>
  );
};