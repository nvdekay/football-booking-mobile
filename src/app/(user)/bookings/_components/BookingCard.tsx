import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Booking } from '../../../../types/booking';

type BookingCardProps = {
    booking: Booking;
    onShowQr: (booking: Booking) => void;
    onShowCancel: (booking: Booking) => void;
    onPayment: (booking: Booking) => void;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgClass: string }> = {
    PENDING_PAYMENT: { label: 'Chờ thanh toán', color: '#d97706', bgClass: 'bg-amber-50 dark:bg-amber-900/20' },
    DEPOSIT_PAID: { label: 'Đã cọc', color: '#2563eb', bgClass: 'bg-blue-50 dark:bg-blue-900/20' },
    CONFIRMED: { label: 'Đã xác nhận', color: '#089166', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20' },
    CANCELLED: { label: 'Đã hủy', color: '#ef4444', bgClass: 'bg-red-50 dark:bg-red-900/20' },
    COMPLETED: { label: 'Hoàn thành', color: '#6b7280', bgClass: 'bg-gray-100 dark:bg-gray-800/50' },
    REFUNDED: { label: 'Đã hoàn tiền', color: '#8b5cf6', bgClass: 'bg-violet-50 dark:bg-violet-900/20' },
};

function formatPrice(price: number): string {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

function getPaymentDeadlineInfo(bookingDate: string): { daysLeft: number; text: string; isUrgent: boolean } {
    const match = new Date(bookingDate);
    match.setHours(0, 0, 0, 0);

    const deadline = new Date(match);
    deadline.setDate(deadline.getDate() - 2);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffMs = deadline.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
        return { daysLeft: 0, text: 'Hạn thanh toán đã hết! Sân sẽ bị hủy tự động.', isUrgent: true };
    } else if (daysLeft === 1) {
        return { daysLeft, text: 'Còn 1 ngày để thanh toán!', isUrgent: true };
    } else if (daysLeft <= 3) {
        return { daysLeft, text: `Còn ${daysLeft} ngày để thanh toán`, isUrgent: true };
    } else {
        return { daysLeft, text: `Còn ${daysLeft} ngày để thanh toán`, isUrgent: false };
    }
}

export function BookingCard({ booking, onShowQr, onShowCancel, onPayment }: BookingCardProps) {
    const status = STATUS_CONFIG[booking.status] || {
        label: booking.status,
        color: '#6b7280',
        bgClass: 'bg-gray-100 dark:bg-gray-800/50',
    };

    const isPendingPayment = booking.status === 'PENDING_PAYMENT';
    const isConfirmed = booking.status === 'CONFIRMED';

    const deadlineInfo = isPendingPayment ? getPaymentDeadlineInfo(booking.booking_date) : null;

    return (
        <View className="mx-5 mb-3 bg-white dark:bg-[#1a2e26] rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
            {/* Field info */}
            <View className="flex-row items-center gap-2 mb-2">
                <MaterialIcons name="sports-soccer" size={18} color="#089166" />
                <Text className="text-sm font-bold text-slate-900 dark:text-white flex-1" numberOfLines={1}>
                    {booking.field_name}
                </Text>
            </View>

            <View className="flex-row items-center gap-2 mb-1">
                <MaterialIcons name="location-on" size={16} color="#94a3b8" />
                <Text className="text-xs text-slate-400 flex-1" numberOfLines={1}>
                    {booking.address}
                </Text>
            </View>

            <View className="flex-row items-center gap-2 mb-1">
                <MaterialIcons name="event" size={16} color="#94a3b8" />
                <Text className="text-xs text-slate-400">
                    {booking.booking_date}
                </Text>
            </View>

            <View className="flex-row items-center gap-2">
                <MaterialIcons name="access-time" size={16} color="#94a3b8" />
                <Text className="text-xs text-slate-400">
                    {booking.start_time} - {booking.end_time}
                </Text>
            </View>

            {/* Divider */}
            <View className="h-px bg-slate-100 dark:bg-slate-700 my-3" />

            {/* Status + Price */}
            <View className="flex-row items-center justify-between">
                <View className={`px-3 py-1 rounded-full ${status.bgClass}`}>
                    <Text style={{ color: status.color }} className="text-xs font-semibold">
                        {status.label}
                    </Text>
                </View>
                <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatPrice(booking.total_price)}
                </Text>
            </View>

            {/* Deadline warning for PENDING_PAYMENT */}
            {isPendingPayment && deadlineInfo && (
                <View className={`flex-row items-center gap-2 mt-3 p-2.5 rounded-xl ${
                    deadlineInfo.isUrgent
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : 'bg-amber-50 dark:bg-amber-900/20'
                }`}>
                    <MaterialIcons
                        name={deadlineInfo.isUrgent ? 'warning' : 'schedule'}
                        size={16}
                        color={deadlineInfo.isUrgent ? '#ef4444' : '#d97706'}
                    />
                    <Text className={`text-xs font-semibold flex-1 ${
                        deadlineInfo.isUrgent
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-700 dark:text-amber-400'
                    }`}>
                        {deadlineInfo.text}
                    </Text>
                </View>
            )}

            {/* Deposit info for PENDING_PAYMENT */}
            {isPendingPayment && (
                <View className="flex-row items-center justify-between mt-2 px-1">
                    <Text className="text-xs text-slate-400">Tiền cọc (30%)</Text>
                    <Text className="text-xs font-bold text-primary">
                        {formatPrice(booking.deposit_amount)}
                    </Text>
                </View>
            )}

            {/* Action buttons for PENDING_PAYMENT */}
            {isPendingPayment && (
                <View className="flex-row gap-3 mt-3">
                    <TouchableOpacity
                        onPress={() => onPayment(booking)}
                        className="flex-1 flex-row items-center justify-center gap-2 bg-primary rounded-xl py-3"
                    >
                        <MaterialIcons name="account-balance-wallet" size={18} color="white" />
                        <Text className="text-white text-sm font-bold">Thanh toán</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onShowCancel(booking)}
                        className="flex-row items-center justify-center gap-1.5 bg-red-50 dark:bg-red-900/20 rounded-xl py-3 px-4"
                    >
                        <MaterialIcons name="cancel" size={18} color="#ef4444" />
                        <Text className="text-red-500 text-sm font-bold">Hủy</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Action buttons for CONFIRMED bookings */}
            {isConfirmed && !booking.check_in_time && (
                <View className="mt-3">
                    <TouchableOpacity
                        onPress={() => onShowQr(booking)}
                        className="flex-row items-center justify-center gap-2 bg-primary rounded-xl py-3"
                    >
                        <MaterialIcons name="qr-code-2" size={18} color="white" />
                        <Text className="text-white text-sm font-bold">Lấy mã QR điểm danh</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Checked-in banner */}
            {isConfirmed && !!booking.check_in_time && (
                <View className="flex-row items-center gap-2 mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                    <MaterialIcons name="check-circle" size={20} color="#089166" />
                    <View className="flex-1">
                        <Text className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            Sẵn sàng để đá
                        </Text>
                        <Text className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                            Đã check-in thành công
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}
