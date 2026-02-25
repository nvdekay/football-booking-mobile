import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

function formatPrice(price: number): string {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

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
    const { token, user, refreshUser } = useAuth();

    const [processing, setProcessing] = useState(false);

    const deposit = parseFloat(depositAmount);
    const total = parseFloat(totalPrice);
    const walletBalance = user?.wallet_balance ?? 0;
    const isBalanceSufficient = walletBalance >= deposit;

    const handlePayment = async () => {
        if (!token) return;

        if (!isBalanceSufficient) {
            Alert.alert(
                'Số dư không đủ',
                `Số dư ví hiện tại: ${formatPrice(walletBalance)}\nSố tiền cần thanh toán: ${formatPrice(deposit)}\n\nVui lòng nạp thêm tiền vào ví.`,
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Nạp tiền',
                        onPress: () => router.push('/(user)/profile/wallet' as any),
                    },
                ]
            );
            return;
        }

        try {
            setProcessing(true);
            const response = await initiatePayment(
                { booking_id: Number(bookingId), method: 'WALLET' },
                token,
            );

            if (response.data.status === 'SUCCESS') {
                await refreshUser();
                Alert.alert('Thành công', 'Đặt sân thành công! Bạn có thể xem chi tiết trong Lịch Đặt.', [
                    {
                        text: 'Xem lịch đặt',
                        onPress: () => {
                            // Dismiss payment screen khỏi home stack, quay về trang chủ
                            if (router.canDismiss()) {
                                router.dismissAll();
                            }
                            // Chuyển sang tab lịch đặt
                            router.navigate('/(user)/bookings' as any);
                        },
                    },
                ]);
            }
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Thanh toán thất bại');
        } finally {
            setProcessing(false);
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

                    {/* Wallet Payment Info */}
                    <View className="mx-5 mt-5">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                            Thanh toán bằng ví
                        </Text>

                        {/* Wallet balance card */}
                        <View className={`p-4 rounded-xl border ${
                            isBalanceSufficient
                                ? 'bg-primary/5 border-primary'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                        }`}>
                            <View className="flex-row items-center gap-3">
                                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                                    isBalanceSufficient ? 'bg-primary/15' : 'bg-red-100 dark:bg-red-900/30'
                                }`}>
                                    <MaterialIcons
                                        name="account-balance-wallet"
                                        size={22}
                                        color={isBalanceSufficient ? '#089166' : '#ef4444'}
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-sm font-bold ${
                                        isBalanceSufficient ? 'text-primary' : 'text-red-500'
                                    }`}>
                                        Số dư ví
                                    </Text>
                                    <Text className={`text-lg font-bold mt-0.5 ${
                                        isBalanceSufficient
                                            ? 'text-slate-900 dark:text-white'
                                            : 'text-red-500'
                                    }`}>
                                        {formatPrice(walletBalance)}
                                    </Text>
                                </View>
                                {isBalanceSufficient && (
                                    <MaterialIcons name="check-circle" size={24} color="#089166" />
                                )}
                            </View>

                            {!isBalanceSufficient && (
                                <View className="mt-3 pt-3 border-t border-red-200 dark:border-red-800">
                                    <Text className="text-xs text-red-500 mb-2">
                                        Số dư không đủ. Bạn cần nạp thêm {formatPrice(deposit - walletBalance)} để thanh toán.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/(user)/profile/wallet' as any)}
                                        className="bg-red-500 rounded-lg py-2 items-center"
                                    >
                                        <Text className="text-white text-sm font-bold">Nạp tiền ngay</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="h-32" />
                </ScrollView>

                {/* Bottom CTA */}
                <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d1c17] border-t border-slate-100 dark:border-slate-800 px-5 pb-8 pt-4">
                    <TouchableOpacity
                        onPress={handlePayment}
                        disabled={processing || !isBalanceSufficient}
                        className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${
                            processing || !isBalanceSufficient
                                ? 'bg-slate-300 dark:bg-slate-700'
                                : 'bg-primary'
                        }`}
                    >
                        {processing && <ActivityIndicator size="small" color="white" />}
                        <Text className="text-white text-base font-bold">
                            {processing
                                ? 'Đang xử lý...'
                                : !isBalanceSufficient
                                    ? 'Số dư không đủ'
                                    : `Thanh toán ${formatPrice(deposit)}`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
