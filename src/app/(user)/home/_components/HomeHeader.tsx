import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export const HomeHeader = () => {
    return (
        <View className="pt-4 pb-2 px-4 flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-background-light/95 dark:bg-background-dark/95">
            <View className="flex-row items-center gap-3">
                <View className="relative">
                    <Image
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCtUGzL0QQliG0YSijxFfJcAx_Jdx1JynpbkmKQ3a-RUuOUPPRvWIesjAg_STjBsqMhkL2UNyHikBzh1tmsO4hGeZPL0OQ8VJ7cn64oWHbi8bOjggvwcOSdVsCQDbZS0BOhdcAFL6g-iy1V0oRedNv_wslcWgos5R138lLlG2pu6w6PkcnaLTdJpZUBHbGlYjuqcYz570IVsb86T1ypww_DiCcPJiF_cU9bVJhsN-B1ty7Ah_avLXKpmTMtmcE5OHSnIrbe1kuLn0s" }}
                        className="w-10 h-10 rounded-full border-2 border-white dark:border-primary"
                    />
                    <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-background-dark" />
                </View>
                <View className="flex-col">
                    <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium">Welcome back,</Text>
                    <Text className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Alex Johnson</Text>
                </View>
            </View>

            <TouchableOpacity className="flex-row items-center gap-2 bg-primary/10 dark:bg-primary/20 rounded-full pl-3 pr-2 py-1.5 border border-primary/10">
                <Text className="text-primary font-bold text-sm">$45.00</Text>
                <View className="bg-primary rounded-full w-5 h-5 items-center justify-center">
                    <MaterialIcons name="add" size={16} color="white" />
                </View>
            </TouchableOpacity>
        </View>
    );
};
