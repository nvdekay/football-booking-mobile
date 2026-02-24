import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '../../../../context/AuthContext';

function formatPrice(price: number): string {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

interface HomeHeaderProps {
    onWalletPress?: () => void;
}

export const HomeHeader = ({ onWalletPress }: HomeHeaderProps) => {
    const { user } = useAuth();

    return (
        <View className="pt-4 pb-2 px-4 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-background-light/95 dark:bg-background-dark/95">
            <View className="flex-row items-center gap-3">
                <View className="relative">
                    {user?.avatar_url ? (
                        <Image
                            source={{ uri: user.avatar_url }}
                            className="w-10 h-10 rounded-full border-2 border-white dark:border-primary"
                        />
                    ) : (
                        <View className="w-10 h-10 rounded-full border-2 border-white dark:border-primary bg-primary/20 items-center justify-center">
                            <MaterialIcons name="person" size={22} color="#089166" />
                        </View>
                    )}
                    <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-background-dark" />
                </View>
                <View className="flex-col">
                    <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">Welcome back,</Text>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                        {user?.full_name ?? 'User'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={onWalletPress}
                className="flex-row items-center gap-2 bg-primary/10 dark:bg-primary/20 rounded-full pl-3 pr-2 py-1.5 border border-primary/10"
            >
                <Text className="text-primary font-bold text-sm">
                    {formatPrice(user?.wallet_balance ?? 0)}
                </Text>
                <View className="bg-primary rounded-full w-5 h-5 items-center justify-center">
                    <MaterialIcons name="add" size={16} color="white" />
                </View>
            </TouchableOpacity>
        </View>
    );
};
