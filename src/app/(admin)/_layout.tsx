import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useChatSocketInit, useChatListeners } from '../../hooks/useChatSocket';
import { useChatStore } from '../../stores/chatStore';
import { socketService } from '../../services/socketService';

export default function AdminLayout() {
    const { user, loading, token } = useAuth();
    const router = useRouter();

    // Initialize socket connection for chat
    useChatSocketInit(token);
    useChatListeners(user?.id ?? null);

    // Disconnect socket and reset chat state on logout
    useEffect(() => {
        if (!user && !loading) {
            socketService.disconnect();
            useChatStore.getState().reset();
        }
    }, [user, loading]);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace('/(auth)/login' as any);
        } else if (user.role === 'USER') {
            router.replace('/(user)/home' as any);
        }
    }, [user, loading]);

    // Compute total unread count for chat badge
    const totalUnread = useChatStore((s) =>
        s.conversations.reduce((sum, c) => sum + c.unread_count, 0)
    );

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#089166',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#f1f5f9',
                    borderTopWidth: 1,
                    paddingTop: 6,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
                    height: Platform.OS === 'ios' ? 85 : 65,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Thống Kê',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="bar-chart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="fields"
                options={{
                    title: 'Sân Bóng',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="sports-soccer" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="manage"
                options={{
                    title: 'Quản Lý',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="settings" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: 'Tin nhắn',
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <MaterialIcons name="chat" size={size} color={color} />
                            {totalUnread > 0 && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        top: -4,
                                        right: -8,
                                        backgroundColor: '#ef4444',
                                        borderRadius: 9,
                                        minWidth: 18,
                                        height: 18,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingHorizontal: 4,
                                    }}
                                >
                                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                                        {totalUnread > 99 ? '99+' : totalUnread}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Tài Khoản',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="index"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
