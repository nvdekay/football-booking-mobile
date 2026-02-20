import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { initiatePayment } from '../../../api/booking';
import { useAuth } from '../../../context/AuthContext';
import { PaymentMethod } from '../../../types/booking';

function formatPrice(price: number): string {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

const PAYMENT_METHODS: { method: PaymentMethod; label: string; icon: keyof typeof MaterialIcons.glyphMap; desc: string }[] = [
    { method: 'WALLET', label: 'Ví tiền', icon: 'account-balance-wallet', desc: 'Thanh toán bằng số dư ví' },
    { method: 'VNPAY', label: 'VNPay', icon: 'credit-card', desc: 'Thanh toán qua VNPay' },
    { method: 'MOMO', label: 'MoMo', icon: 'phone-android', desc: 'Thanh toán qua MoMo' },
];

export default function PaymentScreen() {
    const {
        bookingId,
        totalPrice,
        depositAmount,
        fieldName,
        date,
        startTime,
        duration,
    } = useLocalSearchParams<{
        bookingId: string;
        totalPrice: string;
        depositAmount: string;
        fieldName: string;
        date: string;
        startTime: string;
        duration: string;
    }>();
    const router = useRouter();
    const { token, refreshUser } = useAuth();

    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('WALLET');
    const [processing, setProcessing] = useState(false);

    const handlePayment = async () => {
        if (!token) return;
        try {
            setProcessing(true);
            const response = await initiatePayment(
                { booking_id: Number(bookingId), method: selectedMethod },
                token,
            );

            if (response.data.status === 'SUCCESS') {
                await refreshUser();
                Alert.alert('Thành công', 'Đặt sân thành công! Bạn có thể xem chi tiết trong Lịch Đặt.', [
                    { text: 'OK', onPress: () => router.replace('/(user)/bookings' as any) },
                ]);
            } else if (response.data.payment_url) {
                await WebBrowser.openBrowserAsync(response.data.payment_url);
                await refreshUser();
                router.replace('/(user)/bookings' as any);
            }
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Thanh toán thất bại');
        } finally {
            setProcessing(false);
        }
    };

    const deposit = parseFloat(depositAmount);
    const total = parseFloat(totalPrice);

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
                        Thanh toán
                    </Text>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Booking Info */}
                    <View className="mx-5 bg-white dark:bg-[#1a2e26] rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                        <View className="flex-row items-center gap-2 mb-2">
                            <MaterialIcons name="sports-soccer" size={18} color="#089166" />
                            <Text className="text-sm font-semibold text-slate-900 dark:text-white flex-1">
                                {fieldName}
                            </Text>
                        </View>
                        <Text className="text-xs text-slate-400">
                            {date} | {startTime} | {duration} phút
                        </Text>

                        <View className="h-px bg-slate-100 dark:bg-slate-700 my-3" />

                        <View className="flex-row justify-between">
                            <Text className="text-sm text-slate-500">Tổng tiền</Text>
                            <Text className="text-sm text-slate-900 dark:text-white">
                                {formatPrice(total)}
                            </Text>
                        </View>
                        <View className="flex-row justify-between mt-2">
                            <Text className="text-base font-bold text-primary">Tiền cọc cần trả</Text>
                            <Text className="text-base font-bold text-primary">
                                {formatPrice(deposit)}
                            </Text>
                        </View>
                    </View>

                    {/* Deposit Note */}
                    <View className="mx-5 mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex-row gap-2">
                        <MaterialIcons name="info-outline" size={18} color="#3b82f6" />
                        <Text className="text-xs text-blue-700 dark:text-blue-300 flex-1 leading-4">
                            Bạn chỉ cần thanh toán 30% tiền cọc để xác nhận đặt sân. Phần còn lại sẽ thanh toán tại sân.
                        </Text>
                    </View>

                    {/* Payment Methods */}
                    <View className="mx-5 mt-5">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                            Phương thức thanh toán
                        </Text>
                        <View className="gap-3">
                            {PAYMENT_METHODS.map(({ method, label, icon, desc }) => {
                                const isSelected = method === selectedMethod;
                                return (
                                    <TouchableOpacity
                                        key={method}
                                        onPress={() => setSelectedMethod(method)}
                                        className={`flex-row items-center p-4 rounded-xl border ${
                                            isSelected
                                                ? 'bg-primary/5 border-primary'
                                                : 'bg-white dark:bg-[#1a2e26] border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <View
                                            className={`w-10 h-10 rounded-full items-center justify-center ${
                                                isSelected ? 'bg-primary/15' : 'bg-slate-100 dark:bg-slate-800'
                                            }`}
                                        >
                                            <MaterialIcons
                                                name={icon}
                                                size={22}
                                                color={isSelected ? '#089166' : '#94a3b8'}
                                            />
                                        </View>
                                        <View className="flex-1 ml-3">
                                            <Text
                                                className={`text-sm font-bold ${
                                                    isSelected
                                                        ? 'text-primary'
                                                        : 'text-slate-900 dark:text-white'
                                                }`}
                                            >
                                                {label}
                                            </Text>
                                            <Text className="text-xs text-slate-400 mt-0.5">{desc}</Text>
                                        </View>
                                        <View
                                            className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                                                isSelected ? 'border-primary' : 'border-slate-300 dark:border-slate-600'
                                            }`}
                                        >
                                            {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View className="h-32" />
                </ScrollView>

                {/* Bottom CTA */}
                <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d1c17] border-t border-slate-100 dark:border-slate-800 px-5 pb-8 pt-4">
                    <TouchableOpacity
                        onPress={handlePayment}
                        disabled={processing}
                        className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${
                            processing ? 'bg-slate-300 dark:bg-slate-700' : 'bg-primary'
                        }`}
                    >
                        {processing && <ActivityIndicator size="small" color="white" />}
                        <Text className="text-white text-base font-bold">
                            {processing ? 'Đang xử lý...' : `Thanh toán ${formatPrice(deposit)}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
