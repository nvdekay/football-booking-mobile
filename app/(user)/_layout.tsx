import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import UserHome from './index';

const Tab = createBottomTabNavigator();

export default function UserLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: -4,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="index"
        component={UserHome}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="search"
        component={UserHome}
        options={{
          title: 'Tìm kiếm',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            // TODO: Implement search screen
          },
        })}
      />
      <Tab.Screen
        name="booking"
        component={UserHome}
        options={{
          title: 'Keo dau',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            // TODO: Implement booking screen
          },
        })}
      />
      <Tab.Screen
        name="profile"
        component={UserHome}
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            // TODO: Implement profile screen
          },
        })}
      />
    </Tab.Navigator>
  );
}
