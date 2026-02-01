import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const FilterChips = () => {
    return (
        <View className="py-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                <TouchableOpacity className="flex-row h-9 items-center justify-center gap-2 rounded-full bg-primary px-4 shadow-md shadow-primary/20">
                    <MaterialIcons name="calendar-today" size={18} color="white" />
                    <Text className="text-sm font-medium text-white">Today</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row h-9 items-center justify-center gap-2 rounded-full bg-white dark:bg-[#1a2e26] border border-gray-100 dark:border-gray-800 px-4 shadow-sm">
                    <MaterialIcons name="near-me" size={18} color="#475569" />
                    <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">Nearby</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row h-9 items-center justify-center gap-2 rounded-full bg-white dark:bg-[#1a2e26] border border-gray-100 dark:border-gray-800 px-4 shadow-sm">
                    <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">5-a-side</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row h-9 items-center justify-center gap-2 rounded-full bg-white dark:bg-[#1a2e26] border border-gray-100 dark:border-gray-800 px-4 shadow-sm">
                    <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">7-a-side</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row h-9 items-center justify-center gap-2 rounded-full bg-white dark:bg-[#1a2e26] border border-gray-100 dark:border-gray-800 px-4 shadow-sm">
                    <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">Price</Text>
                    <MaterialIcons name="expand-more" size={16} color="#475569" />
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};
