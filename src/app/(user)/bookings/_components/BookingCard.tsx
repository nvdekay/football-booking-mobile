import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Booking } from '../../../../types/booking';

type BookingCardProps = {
    booking: Booking;
    onShowQr: (booking: Booking) => void;
    onShowCancel: (booking: Booking) => void;
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

export function BookingCard({ booking, onShowQr, onShowCancel }: BookingCardProps) {
    const status = STATUS_CONFIG[booking.status] || {
        label: booking.status,
        color: '#6b7280',
        bgClass: 'bg-gray-100 dark:bg-gray-800/50',
    };
    const isConfirmed = booking.status === 'CONFIRMED';

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

            {/* Action buttons for CONFIRMED bookings */}
            {isConfirmed && (
                <View className="flex-row gap-3 mt-3">
                    <TouchableOpacity
                        onPress={() => onShowQr(booking)}
                        className="flex-1 flex-row items-center justify-center gap-2 bg-primary rounded-xl py-3"
                    >
                        <MaterialIcons name="qr-code-2" size={18} color="white" />
                        <Text className="text-white text-sm font-bold">Lấy mã QR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => onShowCancel(booking)}
                        className="flex-1 flex-row items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-xl py-3"
                    >
                        <MaterialIcons name="cancel" size={18} color="#ef4444" />
                        <Text className="text-red-500 text-sm font-bold">Hủy sân</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
