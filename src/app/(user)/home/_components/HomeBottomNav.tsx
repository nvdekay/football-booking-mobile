import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const HomeBottomNav = () => {
    return (
        <View className="absolute bottom-0 w-full bg-white dark:bg-[#0d1c17] border-t border-gray-100 dark:border-gray-800 pb-5 pt-3 px-6 flex-row justify-between items-center z-30 shadow-sm">
            <TouchableOpacity className="items-center gap-1 group">
                <MaterialIcons name="home" size={26} color="#089166" />
                <Text className="text-[10px] font-medium text-primary">Home</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center gap-1">
                <MaterialIcons name="calendar-today" size={26} color="#94a3b8" />
                <Text className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Bookings</Text>
            </TouchableOpacity>

            <View className="relative -top-6">
                <TouchableOpacity className="bg-primary rounded-full w-14 h-14 shadow-lg shadow-primary/40 items-center justify-center">
                    <MaterialIcons name="sports-soccer" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity className="items-center gap-1">
                <MaterialIcons name="account-balance-wallet" size={26} color="#94a3b8" />
                <Text className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center gap-1">
                <MaterialIcons name="person" size={26} color="#94a3b8" />
                <Text className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Profile</Text>
            </TouchableOpacity>
        </View>
    );
};
