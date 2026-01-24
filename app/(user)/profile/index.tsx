import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { User } from '../../../src/types/auth';
import { ProfileActions, ProfileHeader, ProfileInfo } from './_components';

export default function ProfileScreen() {
  const { user: authUser, refreshUser, logout } = useAuth();
  const [user, setUser] = useState<User | null>(authUser);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshUser();
      setUser(authUser); // Update local state with the refreshed data
    } catch (error: any) {
      Alert.alert('Lỗi', error?.message || 'Không thể làm mới thông tin');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  if (loading && !user) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#16a34a']}
            tintColor={'#16a34a'}
          />
        }
      >
        {/* Header */}
        <ProfileHeader user={user} />
        
        {/* User Information */}
        <ProfileInfo user={user} />
        
        {/* Actions */}
        <ProfileActions 
          onEditProfile={() => Alert.alert('Thông báo', 'Chức năng chỉnh sửa hồ sơ sẽ được cập nhật sau')}
          onChangePassword={() => Alert.alert('Thông báo', 'Chức năng đổi mật khẩu sẽ được cập nhật sau')}
          onSettings={() => Alert.alert('Thông báo', 'Chức năng cài đặt sẽ được cập nhật sau')}
          onSupport={() => Alert.alert('Thông báo', 'Chức năng hỗ trợ sẽ được cập nhật sau')}
          onLogout={handleLogout}
        />
        
        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}