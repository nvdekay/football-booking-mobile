import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function UserLayout() {
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
                name="home"
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="match"
                options={{
                    title: 'Tìm Kèo',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="groups" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="bookings"
                options={{
                    title: 'Lịch Đặt',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="event-note" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Tài khoản',
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
