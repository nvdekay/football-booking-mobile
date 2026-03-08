import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Field } from '../../types/field';

type FeaturedCarouselProps = {
    fields: Field[];
    onFieldPress?: (field: Field) => void;
};

function formatPrice(price: string): string {
    const num = Math.round(parseFloat(price));
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

export const FeaturedCarousel = ({ fields, onFieldPress }: FeaturedCarouselProps) => {
    if (fields.length === 0) return null;

    return (
        <View className="flex-col gap-3">
            <View className="px-4 flex-row justify-between items-end">
                <Text className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                    Sân nổi bật
                </Text>
                <TouchableOpacity>
                    <Text className="text-primary text-sm font-medium">Xem tất cả</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 8 }}
            >
                {fields.map((field) => {
                    const ratingNum = parseFloat(field.rating_avg);

                    const overlay = (
                        <>
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                                locations={[0, 0.4, 1]}
                                className="absolute inset-0"
                            />
                            <View className="absolute top-3 right-3 bg-primary px-2 py-1 rounded-lg shadow-sm">
                                <Text className="text-xs font-bold text-white">
                                    Sân {field.type}
                                </Text>
                            </View>
                            <View className="absolute bottom-0 left-0 p-4 w-full">
                                <Text
                                    className="text-white text-lg font-bold leading-tight mb-1"
                                    numberOfLines={1}
                                >
                                    {field.name}
                                </Text>
                                <View className="flex-row items-center gap-1">
                                    {ratingNum > 0 ? (
                                        <>
                                            <MaterialIcons name="star" size={14} color="#fbbf24" />
                                            <Text className="text-gray-200 text-sm">
                                                {ratingNum.toFixed(1)} ({field.total_reviews})
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <MaterialIcons
                                                name="payments"
                                                size={14}
                                                color="#e5e7eb"
                                            />
                                            <Text className="text-gray-200 text-sm">
                                                {formatPrice(field.price_per_hour)}/giờ
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>
                        </>
                    );

                    return (
                        <TouchableOpacity
                            key={field.field_id}
                            onPress={() => onFieldPress?.(field)}
                            className="w-72 h-44 rounded-2xl overflow-hidden relative shadow-lg"
                        >
                            {field.image_url ? (
                                <ImageBackground
                                    source={{ uri: field.image_url }}
                                    className="flex-1 bg-slate-300 dark:bg-slate-700"
                                    resizeMode="cover"
                                >
                                    {overlay}
                                </ImageBackground>
                            ) : (
                                <View className="flex-1 bg-slate-300 dark:bg-slate-700 items-center justify-center">
                                    <MaterialIcons
                                        name="sports-soccer"
                                        size={48}
                                        color="#94a3b8"
                                    />
                                    {overlay}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};
