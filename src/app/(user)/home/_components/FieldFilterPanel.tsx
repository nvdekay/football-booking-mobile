import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

type FieldFilterPanelProps = {
    minPrice: string;
    maxPrice: string;
    rating: number | null;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    onRatingChange: (value: number | null) => void;
    onApply: () => void;
    onReset: () => void;
};

export const FieldFilterPanel = ({
    minPrice,
    maxPrice,
    rating,
    onMinPriceChange,
    onMaxPriceChange,
    onRatingChange,
    onApply,
    onReset,
}: FieldFilterPanelProps) => {
    return (
        <View className="mx-4 mb-2 p-4 bg-white dark:bg-[#1a2e26] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <Text className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Khoảng giá (₫/giờ)
            </Text>
            <View className="flex-row items-center gap-3 mb-4">
                <View className="flex-1">
                    <TextInput
                        className="bg-gray-50 dark:bg-[#0d1c17] rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white"
                        placeholder="Thấp nhất"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={minPrice}
                        onChangeText={onMinPriceChange}
                    />
                </View>
                <Text className="text-slate-400">—</Text>
                <View className="flex-1">
                    <TextInput
                        className="bg-gray-50 dark:bg-[#0d1c17] rounded-lg px-3 py-2.5 text-sm text-slate-900 dark:text-white"
                        placeholder="Cao nhất"
                        placeholderTextColor="#94a3b8"
                        keyboardType="numeric"
                        value={maxPrice}
                        onChangeText={onMaxPriceChange}
                    />
                </View>
            </View>

            <Text className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Đánh giá tối thiểu
            </Text>
            <View className="flex-row gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        onPress={() => onRatingChange(rating === star ? null : star)}
                    >
                        <MaterialIcons
                            name={rating !== null && star <= rating ? 'star' : 'star-border'}
                            size={28}
                            color={rating !== null && star <= rating ? '#f59e0b' : '#94a3b8'}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <View className="flex-row gap-3">
                <TouchableOpacity
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 items-center"
                    onPress={onReset}
                >
                    <Text className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        Đặt lại
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 py-2.5 rounded-lg bg-primary items-center"
                    onPress={onApply}
                >
                    <Text className="text-sm font-medium text-white">Áp dụng</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
