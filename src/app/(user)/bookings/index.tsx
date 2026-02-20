import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMyBookings } from '../../../api/booking';
import { useAuth } from '../../../context/AuthContext';
import { Booking } from '../../../types/booking';
import { BookingCard } from './_components/BookingCard';
import { CancelModal } from './_components/CancelModal';
import { QRCodeModal } from './_components/QRCodeModal';

export default function BookingsScreen() {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // QR modal state
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [selectedBookingForQr, setSelectedBookingForQr] = useState<Booking | null>(null);

    // Cancel modal state
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<Booking | null>(null);

    const fetchBookings = useCallback(async () => {
        if (!token) return;
        try {
            const response = await getMyBookings(token);
            setBookings(response.data);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể tải danh sách đặt sân');
        }
    }, [token]);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            (async () => {
                setLoading(true);
                await fetchBookings();
                setLoading(false);
            })();
        }, [fetchBookings])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchBookings();
        setRefreshing(false);
    };

    const handleShowQr = (booking: Booking) => {
        setSelectedBookingForQr(booking);
        setQrModalVisible(true);
    };

    const handleShowCancel = (booking: Booking) => {
        setSelectedBookingForCancel(booking);
        setCancelModalVisible(true);
    };

    const handleCancelSuccess = () => {
        setCancelModalVisible(false);
        setSelectedBookingForCancel(null);
        fetchBookings();
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="px-5 py-4">
                    <Text className="text-xl font-bold text-slate-900 dark:text-white">
                        Lịch Đặt
                    </Text>
                    <Text className="text-xs text-slate-400 mt-1">
                        Quản lý các trận đấu và mã QR check-in
                    </Text>
                </View>

                {/* Content */}
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#089166" />
                    </View>
                ) : (
                    <FlatList
                        data={bookings}
                        keyExtractor={(item) => item.booking_id.toString()}
                        renderItem={({ item }) => (
                            <BookingCard
                                booking={item}
                                onShowQr={handleShowQr}
                                onShowCancel={handleShowCancel}
                            />
                        )}
                        contentContainerStyle={{ paddingTop: 4, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#089166"
                                colors={['#089166']}
                            />
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <MaterialIcons name="event-busy" size={64} color="#94a3b8" />
                                <Text className="text-base font-bold text-gray-500 dark:text-gray-400 mt-4">
                                    Bạn chưa có lịch đặt nào
                                </Text>
                                <Text className="text-sm text-gray-400 mt-1">
                                    Hãy tìm sân và đặt lịch ngay!
                                </Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>

            {/* Modals */}
            <QRCodeModal
                visible={qrModalVisible}
                booking={selectedBookingForQr}
                onClose={() => {
                    setQrModalVisible(false);
                    setSelectedBookingForQr(null);
                }}
            />

            <CancelModal
                visible={cancelModalVisible}
                booking={selectedBookingForCancel}
                onClose={() => {
                    setCancelModalVisible(false);
                    setSelectedBookingForCancel(null);
                }}
                onSuccess={handleCancelSuccess}
            />
        </View>
    );
}
