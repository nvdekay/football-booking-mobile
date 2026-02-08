import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface LogoutButtonProps {
    onLogout: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
    return (
        <View className="mt-auto p-8 flex justify-center items-center">
            <TouchableOpacity
                onPress={onLogout}
                className="flex-row items-center gap-2 px-6 py-2.5 rounded-full active:bg-rose-50"
            >
                <Ionicons name="log-out-outline" size={20} color="#f43f5e" />
                <Text className="text-rose-500 font-semibold text-lg">Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};
