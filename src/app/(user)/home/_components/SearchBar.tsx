import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

type SearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    onFilterPress: () => void;
    isFilterActive: boolean;
};

export const SearchBar = ({ value, onChangeText, onFilterPress, isFilterActive }: SearchBarProps) => {
    return (
        <View className="px-4 pt-4 pb-2">
            <View className="relative flex-row items-center">
                <View className="absolute left-0 pl-4 z-10">
                    <MaterialIcons name="search" size={24} color="#089166" />
                </View>
                <TextInput
                    className="flex-1 pl-12 pr-12 py-3.5 bg-white dark:bg-[#1a2e26] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 font-medium text-sm shadow-sm"
                    placeholder="Tìm sân bóng..."
                    placeholderTextColor="#94a3b8"
                    value={value}
                    onChangeText={onChangeText}
                    returnKeyType="search"
                />
                <View className="absolute right-0 pr-3 z-10">
                    <TouchableOpacity
                        className={`p-2 rounded-lg ${isFilterActive ? 'bg-primary/20' : 'bg-gray-100 dark:bg-gray-700'}`}
                        onPress={onFilterPress}
                    >
                        <MaterialIcons
                            name="tune"
                            size={20}
                            color={isFilterActive ? '#089166' : '#64748b'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
