import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createBooking, getServices } from '../../../api/booking';
import { useAuth } from '../../../context/AuthContext';
import { CreateBookingBody, Service } from '../../../types/booking';

function formatPrice(price: number): string {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

export default function CheckoutScreen() {
    const {
        fieldId,
        fieldName,
        fieldAddress,
        date,
        startTime,
        duration,
        estimatedPrice,
    } = useLocalSearchParams<{
        fieldId: string;
        fieldName: string;
        fieldAddress: string;
        date: string;
        startTime: string;
        duration: string;
        estimatedPrice: string;
    }>();
    const router = useRouter();
    const { token } = useAuth();

    const [services, setServices] = useState<Service[]>([]);
    const [serviceSelections, setServiceSelections] = useState<Record<number, number>>({});
    const [loadingServices, setLoadingServices] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const response = await getServices();
                setServices(response.data);
            } catch (err: any) {
                console.error('Failed to load services:', err);
            } finally {
                setLoadingServices(false);
            }
        })();
    }, []);

    const updateQuantity = (serviceId: number, delta: number) => {
        setServiceSelections((prev) => {
            const current = prev[serviceId] || 0;
            const next = Math.max(0, current + delta);
            if (next === 0) {
                const { [serviceId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [serviceId]: next };
        });
    };

    const fieldCost = parseFloat(estimatedPrice);
    const servicesCost = services.reduce((sum, s) => {
        const qty = serviceSelections[s.service_id] || 0;
        return sum + s.price * qty;
    }, 0);
    const totalPrice = fieldCost + servicesCost;
    const depositAmount = Math.round(totalPrice * 0.3);

    const handleBooking = async () => {
        if (!token) return;
        try {
            setSubmitting(true);
            const service_ids = Object.entries(serviceSelections)
                .filter(([, qty]) => qty > 0)
                .map(([id, quantity]) => ({ id: Number(id), quantity }));

            const body: CreateBookingBody = {
                field_id: Number(fieldId),
                date,
                start_time: startTime,
                duration: Number(duration),
                ...(service_ids.length > 0 && { service_ids }),
            };

            const response = await createBooking(body, token);

            router.push({
                pathname: '/(user)/home/payment' as any,
                params: {
                    bookingId: response.data.booking_id.toString(),
                    totalPrice: response.data.total_price.toString(),
                    depositAmount: response.data.deposit_amount.toString(),
                    fieldName,
                    date,
                    startTime,
                    duration,
                },
            });
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể đặt sân');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 gap-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color="#089166" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        Xác nhận đặt sân
                    </Text>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Booking Summary */}
                    <View className="mx-5 bg-white dark:bg-[#1a2e26] rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                            Thông tin đặt sân
                        </Text>

                        <View className="gap-2.5">
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="sports-soccer" size={18} color="#089166" />
                                <Text className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                                    {fieldName}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="location-on" size={18} color="#089166" />
                                <Text className="text-sm text-slate-600 dark:text-slate-400 flex-1" numberOfLines={1}>
                                    {fieldAddress}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="event" size={18} color="#089166" />
                                <Text className="text-sm text-slate-600 dark:text-slate-400">
                                    {date}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="access-time" size={18} color="#089166" />
                                <Text className="text-sm text-slate-600 dark:text-slate-400">
                                    {startTime} | {duration} phút
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Add-on Services */}
                    <View className="mx-5 mt-4">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                            Dịch vụ thêm
                        </Text>

                        {loadingServices ? (
                            <View className="py-6 items-center">
                                <ActivityIndicator size="small" color="#089166" />
                            </View>
                        ) : services.length === 0 ? (
                            <View className="py-6 items-center">
                                <Text className="text-sm text-slate-400">Không có dịch vụ nào</Text>
                            </View>
                        ) : (
                            <View className="gap-3">
                                {services.map((service) => {
                                    const qty = serviceSelections[service.service_id] || 0;
                                    return (
                                        <View
                                            key={service.service_id}
                                            className="bg-white dark:bg-[#1a2e26] rounded-xl p-4 border border-slate-100 dark:border-slate-800 flex-row items-center"
                                        >
                                            <View className="flex-1">
                                                <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                                                    {service.name}
                                                </Text>
                                                <Text className="text-xs text-slate-400 mt-0.5">
                                                    {formatPrice(service.price)}/{service.unit}
                                                </Text>
                                            </View>
                                            <View className="flex-row items-center gap-3">
                                                <TouchableOpacity
                                                    onPress={() => updateQuantity(service.service_id, -1)}
                                                    className={`w-8 h-8 rounded-lg items-center justify-center ${
                                                        qty > 0
                                                            ? 'bg-primary/10'
                                                            : 'bg-slate-100 dark:bg-slate-800'
                                                    }`}
                                                >
                                                    <MaterialIcons
                                                        name="remove"
                                                        size={18}
                                                        color={qty > 0 ? '#089166' : '#94a3b8'}
                                                    />
                                                </TouchableOpacity>
                                                <Text className="text-base font-bold text-slate-900 dark:text-white w-6 text-center">
                                                    {qty}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => updateQuantity(service.service_id, 1)}
                                                    className="w-8 h-8 rounded-lg items-center justify-center bg-primary/10"
                                                >
                                                    <MaterialIcons name="add" size={18} color="#089166" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* Price Breakdown */}
                    <View className="mx-5 mt-4 bg-white dark:bg-[#1a2e26] rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                            Chi tiết thanh toán
                        </Text>

                        <View className="gap-2">
                            <View className="flex-row justify-between">
                                <Text className="text-sm text-slate-500">Tiền sân</Text>
                                <Text className="text-sm font-medium text-slate-900 dark:text-white">
                                    {formatPrice(fieldCost)}
                                </Text>
                            </View>
                            {servicesCost > 0 && (
                                <View className="flex-row justify-between">
                                    <Text className="text-sm text-slate-500">Dịch vụ thêm</Text>
                                    <Text className="text-sm font-medium text-slate-900 dark:text-white">
                                        {formatPrice(servicesCost)}
                                    </Text>
                                </View>
                            )}
                            <View className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                            <View className="flex-row justify-between">
                                <Text className="text-sm font-bold text-slate-900 dark:text-white">
                                    Tổng cộng
                                </Text>
                                <Text className="text-sm font-bold text-slate-900 dark:text-white">
                                    {formatPrice(totalPrice)}
                                </Text>
                            </View>
                            <View className="flex-row justify-between bg-primary/5 rounded-lg px-3 py-2 mt-1">
                                <Text className="text-sm font-bold text-primary">
                                    Tiền cọc (30%)
                                </Text>
                                <Text className="text-sm font-bold text-primary">
                                    {formatPrice(depositAmount)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="h-32" />
                </ScrollView>

                {/* Bottom CTA */}
                <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d1c17] border-t border-slate-100 dark:border-slate-800 px-5 pb-8 pt-4">
                    <TouchableOpacity
                        onPress={handleBooking}
                        disabled={submitting}
                        className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${
                            submitting ? 'bg-slate-300 dark:bg-slate-700' : 'bg-primary'
                        }`}
                    >
                        {submitting && <ActivityIndicator size="small" color="white" />}
                        <Text className="text-white text-base font-bold">
                            {submitting ? 'Đang xử lý...' : 'Đặt sân'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
