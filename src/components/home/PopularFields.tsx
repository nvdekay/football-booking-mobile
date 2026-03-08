import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import { Field } from '../../types/field';

type PopularFieldsProps = {
    fields: Field[];
    loading: boolean;
    onFieldPress?: (field: Field) => void;
};

const TYPE_LABELS: Record<string, string> = {
    '5': 'Sân 5',
    '7': 'Sân 7',
    '11': 'Sân 11',
};

const TYPE_COLORS: Record<string, string> = {
    '5': '#4f46e5',
    '7': '#089166',
    '11': '#d97706',
};

function formatPrice(price: string): string {
    const num = Math.round(parseFloat(price));
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

const FieldCard = ({ field, onPress }: { field: Field; onPress?: () => void }) => {
    const ratingNum = parseFloat(field.rating_avg);
    const typeLabel = TYPE_LABELS[field.type] || `Sân ${field.type}`;
    const typeColor = TYPE_COLORS[field.type] || '#089166';

    return (
        <TouchableOpacity onPress={onPress} className="flex-col w-full bg-white dark:bg-[#1a2e26] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
            {field.image_url ? (
                <ImageBackground
                    source={{ uri: field.image_url }}
                    className="h-40 w-full bg-slate-200 dark:bg-slate-700"
                    resizeMode="cover"
                >
                    <View className="absolute top-3 left-3 flex-row gap-2">
                        <View className="bg-white/95 dark:bg-black/80 px-2.5 py-1 rounded-md">
                            <Text
                                className="text-xs font-bold tracking-wide uppercase"
                                style={{ color: typeColor }}
                            >
                                {typeLabel}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity className="absolute top-3 right-3 bg-white/20 rounded-full p-1.5 backdrop-blur-md">
                        <MaterialIcons name="favorite-border" size={20} color="white" />
                    </TouchableOpacity>
                </ImageBackground>
            ) : (
                <View className="h-40 w-full bg-slate-200 dark:bg-slate-700 items-center justify-center">
                    <MaterialIcons name="sports-soccer" size={48} color="#94a3b8" />
                    <View className="absolute top-3 left-3 flex-row gap-2">
                        <View className="bg-white/95 dark:bg-black/80 px-2.5 py-1 rounded-md">
                            <Text
                                className="text-xs font-bold tracking-wide uppercase"
                                style={{ color: typeColor }}
                            >
                                {typeLabel}
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            <View className="p-4 flex-col gap-3">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 pr-3">
                        <Text
                            className="text-lg font-bold text-slate-900 dark:text-white"
                            numberOfLines={1}
                        >
                            {field.name}
                        </Text>
                        <View className="flex-row items-center gap-1.5 mt-1">
                            <MaterialIcons name="location-on" size={18} color="#089166" />
                            <Text
                                className="text-slate-500 dark:text-slate-400 text-sm flex-1"
                                numberOfLines={1}
                            >
                                {field.address}
                            </Text>
                        </View>
                        {field.distance != null && (
                            <View className="flex-row items-center gap-1 mt-1">
                                <MaterialIcons name="near-me" size={14} color="#64748b" />
                                <Text className="text-slate-400 dark:text-slate-500 text-xs">
                                    Cách bạn {field.distance.toFixed(2)}km
                                </Text>
                            </View>
                        )}
                    </View>
                    <View className="items-end">
                        <Text className="text-primary font-bold text-lg leading-tight">
                            {formatPrice(field.price_per_hour)}
                        </Text>
                        <Text className="text-xs text-slate-400 font-normal">mỗi giờ</Text>
                    </View>
                </View>

                <View className="h-px w-full bg-slate-100 dark:bg-slate-700/50" />

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-1">
                        <MaterialIcons
                            name="star"
                            size={16}
                            color={ratingNum > 0 ? '#f59e0b' : '#94a3b8'}
                        />
                        <Text
                            className="text-xs font-medium"
                            style={{ color: ratingNum > 0 ? '#f59e0b' : '#94a3b8' }}
                        >
                            {ratingNum > 0
                                ? `${ratingNum.toFixed(1)} (${field.total_reviews})`
                                : 'Chưa có đánh giá'}
                        </Text>
                    </View>
                    <TouchableOpacity className="bg-primary/5 px-3 py-1.5 rounded-lg">
                        <Text className="text-primary text-sm font-semibold">Chi tiết</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export const PopularFields = ({ fields, loading, onFieldPress }: PopularFieldsProps) => {
    return (
        <View className="flex-col px-4 gap-4 mt-4 pb-8">
            <Text className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-left">
                Sân bóng phổ biến
            </Text>

            {loading ? (
                <View className="py-8 items-center">
                    <ActivityIndicator size="large" color="#089166" />
                </View>
            ) : fields.length === 0 ? (
                <View className="py-8 items-center gap-2">
                    <MaterialIcons name="search-off" size={48} color="#94a3b8" />
                    <Text className="text-slate-400 text-sm">Không tìm thấy sân bóng nào</Text>
                </View>
            ) : (
                fields.map((field) => <FieldCard key={field.field_id} field={field} onPress={() => onFieldPress?.(field)} />)
            )}
        </View>
    );
};
