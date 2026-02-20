import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MatchScreen() {
    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1 items-center justify-center px-6">
                <MaterialIcons name="groups" size={64} color="#94a3b8" />
                <Text className="text-xl font-bold text-gray-800 dark:text-white mt-4">
                    Tìm Kèo
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">
                    Bảng tin tìm đối thủ - Tính năng đang phát triển
                </Text>
            </SafeAreaView>
        </View>
    );
}
