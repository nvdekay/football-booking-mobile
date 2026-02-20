import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { cancelBooking } from '../../../../api/booking';
import { useAuth } from '../../../../context/AuthContext';
import { Booking } from '../../../../types/booking';

type CancelModalProps = {
    visible: boolean;
    booking: Booking | null;
    onClose: () => void;
    onSuccess: () => void;
};

export function CancelModal({ visible, booking, onClose, onSuccess }: CancelModalProps) {
    const { token } = useAuth();
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        setReason('');
        onClose();
    };

    const handleCancel = async () => {
        if (!booking || !token) return;

        const trimmed = reason.trim();
        if (!trimmed) {
            Alert.alert('Thông báo', 'Vui lòng nhập lý do hủy');
            return;
        }

        try {
            setSubmitting(true);
            await cancelBooking(booking.booking_id, trimmed, token);
            setReason('');
            Alert.alert('Thành công', 'Đã hủy đặt sân thành công', [
                { text: 'OK', onPress: onSuccess },
            ]);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể hủy đặt sân');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <Pressable onPress={handleClose} className="flex-1 bg-black/50 justify-center items-center">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="w-[85%]"
                >
                    <Pressable onPress={() => {}} className="bg-white dark:bg-[#1a2e26] rounded-2xl p-6">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white">
                                Hủy đặt sân
                            </Text>
                            <TouchableOpacity onPress={handleClose}>
                                <MaterialIcons name="close" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        {/* Warning */}
                        <View className="items-center mb-4">
                            <MaterialIcons name="warning" size={40} color="#f59e0b" />
                            <Text className="text-sm text-slate-600 dark:text-slate-300 text-center mt-2">
                                Bạn có chắc chắn muốn hủy đặt sân này?
                            </Text>
                        </View>

                        {/* Booking info */}
                        {booking && (
                            <View className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-4">
                                <Text className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {booking.field_name}
                                </Text>
                                <Text className="text-xs text-slate-400 mt-1">
                                    {booking.booking_date} | {booking.start_time} - {booking.end_time}
                                </Text>
                            </View>
                        )}

                        {/* Reason input */}
                        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Lý do hủy
                        </Text>
                        <TextInput
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Nhập lý do hủy..."
                            placeholderTextColor="#94a3b8"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-slate-900 dark:text-white text-sm border border-slate-200 dark:border-slate-700 min-h-[80px]"
                        />

                        {/* Buttons */}
                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                onPress={handleClose}
                                className="flex-1 rounded-xl py-3 items-center border border-slate-200 dark:border-slate-700"
                            >
                                <Text className="text-sm font-bold text-slate-600 dark:text-slate-300">
                                    Đóng
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleCancel}
                                disabled={submitting}
                                className={`flex-1 rounded-xl py-3 items-center flex-row justify-center gap-2 ${
                                    submitting ? 'bg-red-300' : 'bg-red-500'
                                }`}
                            >
                                {submitting && <ActivityIndicator size="small" color="white" />}
                                <Text className="text-white text-sm font-bold">
                                    {submitting ? 'Đang hủy...' : 'Xác nhận hủy'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </KeyboardAvoidingView>
            </Pressable>
        </Modal>
    );
}
