import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';

interface HeaderProps {
  name?: string;
}

export const Header: React.FC<HeaderProps> = ({ name = 'Người dùng' }) => {
  const { user, logout } = useAuth();
  const displayName = user?.full_name || name;
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    setShowMenu(false);
    await logout();
    // Navigation will be handled automatically by useProtectedRoute
  };

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
        
        <TouchableOpacity onPress={() => setShowMenu(true)}>
          <Ionicons name="menu-outline" size={24} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black bg-opacity-50"
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View className="absolute right-4 top-20 bg-white rounded-lg shadow-lg p-2 w-40">
            <TouchableOpacity
              className="flex-row items-center p-3 border-b border-gray-100"
              onPress={() => setShowMenu(false)}
            >
              <Ionicons name="person-outline" size={20} color="#666666" />
              <Text className="ml-3 text-gray-900">Hồ sơ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center p-3"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text className="ml-3 text-red-500">Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
