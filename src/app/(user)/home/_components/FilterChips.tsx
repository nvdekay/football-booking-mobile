import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FieldType } from '../../../../types/field';

type FilterChipsProps = {
    selectedType: FieldType | null;
    onTypeChange: (type: FieldType | null) => void;
};

const FIELD_TYPES: { label: string; value: FieldType | null }[] = [
    { label: 'Tất cả', value: null },
    { label: 'Sân 5', value: '5' },
    { label: 'Sân 7', value: '7' },
    { label: 'Sân 11', value: '11' },
];

export const FilterChips = ({ selectedType, onTypeChange }: FilterChipsProps) => {
    return (
        <View className="py-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
            >
                {FIELD_TYPES.map((item) => {
                    const isActive = selectedType === item.value;
                    return (
                        <TouchableOpacity
                            key={item.label}
                            className={`flex-row h-9 items-center justify-center rounded-full px-4 ${
                                isActive
                                    ? 'bg-primary shadow-md shadow-primary/20'
                                    : 'bg-white dark:bg-[#1a2e26] border border-gray-100 dark:border-gray-800 shadow-sm'
                            }`}
                            onPress={() => onTypeChange(item.value)}
                        >
                            <Text
                                className={`text-sm font-medium ${
                                    isActive
                                        ? 'text-white'
                                        : 'text-slate-600 dark:text-slate-300'
                                }`}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};
