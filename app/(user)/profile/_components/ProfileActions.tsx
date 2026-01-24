import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ProfileActionsProps {
  onEditProfile: () => void;
  onChangePassword: () => void;
  onSettings: () => void;
  onSupport: () => void;
  onLogout: () => void;
}

interface ActionItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  showBorder?: boolean;
  danger?: boolean;
}

const ActionItem: React.FC<ActionItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  iconColor = "#666666",
  showBorder = true,
  danger = false,
}) => (
  <TouchableOpacity 
    className={`flex-row items-center py-4 ${showBorder ? 'border-b border-gray-50' : ''}`}
    onPress={onPress}
  >
    <View className="w-10">
      <Ionicons name={icon as any} size={22} color={danger ? '#ef4444' : iconColor} />
    </View>
    <View className="flex-1 ml-3">
      <Text className={`text-base font-medium ${danger ? 'text-red-500' : 'text-gray-900'}`}>
        {title}
      </Text>
      {subtitle && (
        <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
      )}
    </View>
    <Ionicons 
      name="chevron-forward" 
      size={20} 
      color={danger ? '#ef4444' : '#9ca3af'} 
    />
  </TouchableOpacity>
);

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  onEditProfile,
  onChangePassword,
  onSettings,
  onSupport,
  onLogout,
}) => {
  return (
    <View className="mx-4">
      {/* Account Actions */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Tài khoản
        </Text>
        
        <ActionItem
          icon="create-outline"
          title="Chỉnh sửa hồ sơ"
          subtitle="Cập nhật thông tin cá nhân"
          onPress={onEditProfile}
          iconColor="#16a34a"
        />
        
        <ActionItem
          icon="key-outline"
          title="Đổi mật khẩu"
          subtitle="Thay đổi mật khẩu bảo mật"
          onPress={onChangePassword}
          iconColor="#f59e0b"
        />
        
        <ActionItem
          icon="notifications-outline"
          title="Cài đặt thông báo"
          subtitle="Quản lý thông báo của bạn"
          onPress={onSettings}
          iconColor="#3b82f6"
          showBorder={false}
        />
      </View>

      {/* App Actions */}
      <View className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Ứng dụng
        </Text>
        
        <ActionItem
          icon="settings-outline"
          title="Cài đặt"
          subtitle="Tùy chỉnh ứng dụng"
          onPress={onSettings}
          iconColor="#8b5cf6"
        />
        
        <ActionItem
          icon="help-circle-outline"
          title="Hỗ trợ"
          subtitle="Liên hệ đội ngũ hỗ trợ"
          onPress={onSupport}
          iconColor="#06b6d4"
        />
        
        <ActionItem
          icon="information-circle-outline"
          title="Về chúng tôi"
          subtitle="Thông tin ứng dụng"
          onPress={() => {}}
          iconColor="#6b7280"
          showBorder={false}
        />
      </View>

      {/* Logout */}
      <View className="bg-white rounded-xl p-4 shadow-sm">
        <ActionItem
          icon="log-out-outline"
          title="Đăng xuất"
          subtitle="Đăng xuất khỏi tài khoản"
          onPress={onLogout}
          danger={true}
          showBorder={false}
        />
      </View>
    </View>
  );
};