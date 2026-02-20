import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, SafeAreaView, ScrollView, View } from 'react-native';
import { useAuth } from '../../../context/AuthContext';
import { User } from '../../../types/auth';
import { LogoutButton, MenuList, ProfileHeader, ProfileInfo, WalletCard } from './_components';

export default function ProfileScreen() {
  const router = useRouter();
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
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleSettings = () => {
    Alert.alert('Settings', 'This feature will be updated soon');
  };

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    }
  }, [authUser]);

  if (loading && !user) {
    return (
      <SafeAreaView className="flex-1 bg-[#f5f8f7]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0df2aa" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#f5f8f7]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0df2aa']}
            tintColor={'#0df2aa'}
          />
        }
        className="bg-[#f5f8f7]"
        contentContainerStyle={{ paddingBottom: 20 }}
        stickyHeaderIndices={[0]}
      >
        {/* Header */}
        <ProfileHeader />

        {/* User Information */}
        <ProfileInfo user={user} />

        {/* Wallet Card */}
        <WalletCard
          balance={user?.wallet_balance ?? 0}
          onTopup={() => router.push('/(user)/profile/wallet' as any)}
        />

        {/* Menu List */}
        <MenuList
          onSettings={handleSettings}
          onTransactionHistory={() => router.push({ pathname: '/(user)/profile/wallet' as any, params: { tab: 'history' } })}
        />

        {/* Logout Button */}
        <LogoutButton onLogout={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}