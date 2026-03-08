import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { getBookingQr } from '../../api/booking';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types/booking';

type QRCodeModalProps = {
    visible: boolean;
    booking: Booking | null;
    onClose: () => void;
};

export function QRCodeModal({ visible, booking, onClose }: QRCodeModalProps) {
    const { token } = useAuth();
    const [checkInCode, setCheckInCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (visible && booking && token) {
            fetchQrCode();
        }
        if (!visible) {
            setCheckInCode(null);
            setError(null);
        }
    }, [visible, booking]);

    const fetchQrCode = async () => {
        if (!booking || !token) return;
        try {
            setLoading(true);
            setError(null);
            const response = await getBookingQr(booking.booking_id, token);
            setCheckInCode(response.data.check_in_code);
        } catch (err: any) {
            setError(err.message || 'Không thể tải mã QR');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable onPress={onClose} className="flex-1 bg-black/50 justify-center items-center">
                <Pressable onPress={() => {}} className="bg-white dark:bg-[#1a2e26] rounded-2xl mx-6 p-6 w-[85%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white">
                            Mã QR điểm danh
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <MaterialIcons name="close" size={24} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    {/* Booking info */}
                    {booking && (
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                                {booking.field_name}
                            </Text>
                            <Text className="text-xs text-slate-400 mt-1">
                                {booking.booking_date} | {booking.start_time} - {booking.end_time}
                            </Text>
                        </View>
                    )}

                    {/* QR Content */}
                    {loading && (
                        <View className="items-center py-10">
                            <ActivityIndicator size="large" color="#089166" />
                            <Text className="text-sm text-slate-400 mt-3">Đang tải mã QR...</Text>
                        </View>
                    )}

                    {error && (
                        <View className="items-center py-6">
                            <MaterialIcons name="error-outline" size={48} color="#ef4444" />
                            <Text className="text-sm text-red-500 mt-2 text-center">{error}</Text>
                            <TouchableOpacity
                                onPress={fetchQrCode}
                                className="mt-4 bg-primary rounded-xl px-6 py-2"
                            >
                                <Text className="text-white text-sm font-bold">Thử lại</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {checkInCode && !loading && !error && (
                        <View className="items-center">
                            <View className="bg-white p-4 rounded-xl">
                                <QRCode
                                    value={checkInCode}
                                    size={200}
                                    color="#0f172a"
                                    backgroundColor="white"
                                />
                            </View>

                            <Text className="text-xs text-slate-400 mt-3 text-center font-mono">
                                {checkInCode}
                            </Text>

                            <View className="flex-row items-center gap-2 mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl px-4 py-3">
                                <MaterialIcons name="info-outline" size={16} color="#3b82f6" />
                                <Text className="text-xs text-blue-700 dark:text-blue-300 flex-1">
                                    Xuất trình mã QR này tại sân để điểm danh
                                </Text>
                            </View>
                        </View>
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}
