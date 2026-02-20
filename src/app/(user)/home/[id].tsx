import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addFavorite, getFieldById, removeFavorite } from '../../../api/field';
import { useAuth } from '../../../context/AuthContext';
import { FieldDetail } from '../../../types/field';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DAY_LABELS: Record<string, string> = {
    '0': 'CN',
    '1': 'T2',
    '2': 'T3',
    '3': 'T4',
    '4': 'T5',
    '5': 'T6',
    '6': 'T7',
};

function formatPrice(price: number | string): string {
    const num = Math.round(typeof price === 'string' ? parseFloat(price) : price);
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

function formatDays(daysStr: string): string {
    return daysStr
        .split(',')
        .map((d) => DAY_LABELS[d.trim()] || d.trim())
        .join(', ');
}

function formatTime(time: string): string {
    return time.substring(0, 5);
}

export default function FieldDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { token } = useAuth();

    const [field, setField] = useState<FieldDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [togglingFav, setTogglingFav] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const response = await getFieldById(Number(id));
                setField(response.data);
            } catch (err: any) {
                Alert.alert('Lỗi', err.message || 'Không thể tải thông tin sân');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleToggleFavorite = async () => {
        if (!token || !field) return;
        try {
            setTogglingFav(true);
            if (isFavorite) {
                await removeFavorite(field.field_id, token);
            } else {
                await addFavorite(field.field_id, token);
            }
            setIsFavorite(!isFavorite);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message);
        } finally {
            setTogglingFav(false);
        }
    };

    const handleViewAvailability = () => {
        if (!field) return;
        router.push({
            pathname: '/(user)/home/availability' as any,
            params: {
                fieldId: field.field_id.toString(),
                fieldName: field.name,
                fieldAddress: field.address,
                pricePerHour: field.price_per_hour,
            },
        });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <ActivityIndicator size="large" color="#089166" />
            </View>
        );
    }

    if (!field) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center px-6">
                <MaterialIcons name="error-outline" size={64} color="#94a3b8" />
                <Text className="text-lg font-bold text-gray-800 dark:text-white mt-4">
                    Không tìm thấy sân
                </Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-primary font-semibold">Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const images = field.images?.length > 0 ? field.images : (field.image_url ? [field.image_url] : []);
    const ratingNum = parseFloat(field.rating_avg);

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="light" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Image Gallery */}
                <View className="relative">
                    {images.length > 0 ? (
                        <FlatList
                            data={images}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                                setActiveImageIndex(index);
                            }}
                            renderItem={({ item }) => (
                                <Image
                                    source={{ uri: item }}
                                    style={{ width: SCREEN_WIDTH, height: 280 }}
                                    resizeMode="cover"
                                />
                            )}
                            keyExtractor={(_, i) => i.toString()}
                        />
                    ) : (
                        <View
                            style={{ width: SCREEN_WIDTH, height: 280 }}
                            className="bg-slate-200 dark:bg-slate-700 items-center justify-center"
                        >
                            <MaterialIcons name="sports-soccer" size={64} color="#94a3b8" />
                        </View>
                    )}

                    {/* Back Button */}
                    <SafeAreaView edges={['top']} className="absolute top-0 left-0 right-0">
                        <View className="flex-row justify-between items-center px-4 pt-2">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="bg-black/40 rounded-full p-2"
                            >
                                <MaterialIcons name="arrow-back" size={24} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleToggleFavorite}
                                disabled={togglingFav}
                                className="bg-black/40 rounded-full p-2"
                            >
                                <MaterialIcons
                                    name={isFavorite ? 'favorite' : 'favorite-border'}
                                    size={24}
                                    color={isFavorite ? '#ef4444' : 'white'}
                                />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    {/* Image Indicators */}
                    {images.length > 1 && (
                        <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1.5">
                            {images.map((_, i) => (
                                <View
                                    key={i}
                                    className={`h-2 rounded-full ${i === activeImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                                />
                            ))}
                        </View>
                    )}
                </View>

                {/* Field Info */}
                <View className="px-5 pt-5 pb-3">
                    <View className="flex-row items-center gap-2 mb-2">
                        <View className="bg-primary/10 px-3 py-1 rounded-lg">
                            <Text className="text-primary text-xs font-bold">Sân {field.type}</Text>
                        </View>
                        {ratingNum > 0 && (
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="star" size={16} color="#f59e0b" />
                                <Text className="text-sm font-semibold text-amber-500">
                                    {ratingNum.toFixed(1)}
                                </Text>
                                <Text className="text-xs text-slate-400">
                                    ({field.total_reviews} đánh giá)
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                        {field.name}
                    </Text>

                    <View className="flex-row items-center gap-1.5 mt-2">
                        <MaterialIcons name="location-on" size={18} color="#089166" />
                        <Text className="text-slate-500 dark:text-slate-400 text-sm flex-1">
                            {field.address}
                        </Text>
                    </View>

                    <View className="flex-row items-center gap-1.5 mt-2">
                        <MaterialIcons name="payments" size={18} color="#089166" />
                        <Text className="text-lg font-bold text-primary">
                            {formatPrice(field.price_per_hour)}
                        </Text>
                        <Text className="text-sm text-slate-400">/giờ</Text>
                    </View>
                </View>

                {/* Description */}
                {field.description ? (
                    <View className="px-5 py-3">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-2">
                            Mô tả
                        </Text>
                        <Text className="text-sm text-slate-600 dark:text-slate-400 leading-5">
                            {field.description}
                        </Text>
                    </View>
                ) : null}

                {/* Pricing Rules */}
                {field.pricing_rules?.length > 0 && (
                    <View className="px-5 py-3">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                            Bảng giá đặc biệt
                        </Text>
                        <View className="gap-2">
                            {field.pricing_rules
                                .filter((r) => r.is_active)
                                .map((rule) => (
                                    <View
                                        key={rule.rule_id}
                                        className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
                                    >
                                        <View className="flex-row justify-between items-center">
                                            <View className="flex-1">
                                                <Text className="text-sm font-bold text-amber-800 dark:text-amber-300">
                                                    {rule.name}
                                                </Text>
                                                <Text className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                    {formatTime(rule.start_time)} - {formatTime(rule.end_time)} | {formatDays(rule.days_of_week)}
                                                </Text>
                                            </View>
                                            <Text className="text-base font-bold text-amber-700 dark:text-amber-300">
                                                {formatPrice(rule.price_per_hour)}/h
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                        </View>
                    </View>
                )}

                <View className="h-24" />
            </ScrollView>

            {/* Bottom CTA */}
            <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d1c17] border-t border-slate-100 dark:border-slate-800 px-5 pb-8 pt-4">
                <TouchableOpacity
                    onPress={handleViewAvailability}
                    className="bg-primary rounded-xl py-4 items-center"
                >
                    <Text className="text-white text-base font-bold">Xem lịch trống</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
