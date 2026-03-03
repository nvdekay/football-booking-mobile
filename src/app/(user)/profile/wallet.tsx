import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getWalletHistory, topupWallet } from '../../../api/wallet';
import { useAuth } from '../../../context/AuthContext';
import { WalletTransaction } from '../../../types/wallet';

function formatPrice(price: number | null | undefined): string {
    if (price == null || isNaN(price)) return '0₫';
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
        return '';
    }
}

function formatBookingDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    try {
        // dateStr comes as "YYYY-MM-DD" from MySQL DATE type
        const parts = dateStr.split('T')[0].split('-');
        if (parts.length < 3) return '';
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    } catch {
        return '';
    }
}

function formatTime(timeStr: string | null | undefined): string {
    if (!timeStr) return '';
    // timeStr comes as "HH:MM:SS" from MySQL TIME type
    return timeStr.substring(0, 5);
}

function getTransactionTitle(item: WalletTransaction): string {
    if (item?.field_name) {
        if (item.type === 'PAYMENT') return `Thanh toán cho sân ${item.field_name}`;
        if (item.type === 'REFUND') return `Hoàn tiền cho sân ${item.field_name}`;
    }
    return item?.description || 'Giao dịch';
}

function getTransactionSubtitle(item: WalletTransaction): string {
    if (item?.booking_date && item?.start_time) {
        const date = formatBookingDate(item.booking_date);
        const start = formatTime(item.start_time);
        const end = formatTime(item.end_time);
        if (date && start) {
            return end ? `${date}  |  ${start} - ${end}` : `${date}  |  ${start}`;
        }
    }
    return formatDate(item?.created_at);
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000];

const PAYMENT_METHODS: { method: 'VNPAY' | 'MOMO'; label: string; icon: keyof typeof MaterialIcons.glyphMap; desc: string }[] = [
    { method: 'VNPAY', label: 'VNPay', icon: 'credit-card', desc: 'Nạp qua VNPay' },
    { method: 'MOMO', label: 'MoMo', icon: 'phone-android', desc: 'Nạp qua MoMo' },
];

const TYPE_CONFIG: Record<string, {
    iconName: keyof typeof MaterialIcons.glyphMap;
    iconBgClass: string;
    iconColor: string;
    amountColor: string;
    prefix: string;
    label: string;
    badgeBgClass: string;
}> = {
    DEPOSIT: {
        iconName: 'arrow-downward',
        iconBgClass: 'bg-emerald-500/10',
        iconColor: '#089166',
        amountColor: '#089166',
        prefix: '+',
        label: 'Nạp tiền',
        badgeBgClass: 'bg-emerald-500/10',
    },
    PAYMENT: {
        iconName: 'arrow-upward',
        iconBgClass: 'bg-red-500/10',
        iconColor: '#ef4444',
        amountColor: '',
        prefix: '-',
        label: 'Thanh toán',
        badgeBgClass: 'bg-slate-100 dark:bg-white/10',
    },
    REFUND: {
        iconName: 'replay',
        iconBgClass: 'bg-blue-500/10',
        iconColor: '#3b82f6',
        amountColor: '#3b82f6',
        prefix: '+',
        label: 'Hoàn tiền',
        badgeBgClass: 'bg-blue-500/10',
    },
};

export default function WalletScreen() {
    const { token, user, refreshUser, updateWalletBalance } = useAuth();
    const mountedRef = useRef(true);

    // History state
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);

    // Topup modal state
    const [showTopup, setShowTopup] = useState(false);
    const [amount, setAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'MOMO'>('VNPAY');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    const fetchHistory = useCallback(async () => {
        if (!token) return;
        try {
            setHistoryError(null);
            const response = await getWalletHistory(token);
            if (!mountedRef.current) return;
            const data = response?.data;
            setTransactions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            if (!mountedRef.current) return;
            setHistoryError(err?.message || 'Không thể tải lịch sử giao dịch');
        } finally {
            if (mountedRef.current) setLoadingHistory(false);
        }
    }, [token]);

    useEffect(() => {
        refreshUser().catch(() => {});
        fetchHistory();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([fetchHistory(), refreshUser().catch(() => {})]);
        } catch {}
        if (mountedRef.current) setRefreshing(false);
    };

    const getEffectiveAmount = (): number => {
        if (amount) return amount;
        const parsed = parseInt(customAmount, 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    const handleTopup = async () => {
        if (!token) return;
        const effectiveAmount = getEffectiveAmount();
        if (effectiveAmount <= 0) {
            Alert.alert('Thông báo', 'Vui lòng nhập số tiền hợp lệ');
            return;
        }
        try {
            setProcessing(true);
            const response = await topupWallet(
                { amount: effectiveAmount, payment_method: paymentMethod },
                token
            );

            // Instantly update balance from API response
            if (response?.data?.new_balance != null) {
                updateWalletBalance(response.data.new_balance);
            }

            // Close modal and reset form
            setShowTopup(false);
            setAmount(null);
            setCustomAmount('');

            // Fetch history in background
            fetchHistory();

            // Show success alert after modal close animation
            setTimeout(() => {
                Alert.alert(
                    'Nạp tiền thành công!',
                    `Đã nạp ${formatPrice(effectiveAmount)} vào ví của bạn.`
                );
            }, 400);
        } catch (err: any) {
            Alert.alert('Lỗi', err?.message || 'Nạp tiền thất bại');
        } finally {
            if (mountedRef.current) setProcessing(false);
        }
    };

    const renderTransactionItem = ({ item }: { item: WalletTransaction }) => {
        try {
            const config = TYPE_CONFIG[item?.type] || TYPE_CONFIG.PAYMENT;
            const isPayment = item?.type === 'PAYMENT';
            return (
                <View className="flex-row items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1a2c26] border border-slate-100 dark:border-white/5 mb-3">
                    <View className="flex-row items-center gap-3 flex-1 mr-3">
                        <View className={`w-12 h-12 rounded-full ${config.iconBgClass} items-center justify-center`}>
                            <MaterialIcons
                                name={config.iconName}
                                size={22}
                                color={config.iconColor}
                                style={{ transform: [{ rotate: '45deg' }] }}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-slate-900 dark:text-white text-sm" numberOfLines={1}>
                                {getTransactionTitle(item)}
                            </Text>
                            <Text className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {getTransactionSubtitle(item)}
                            </Text>
                        </View>
                    </View>
                    <View className="items-end">
                        <Text
                            className={`font-bold text-base ${isPayment ? 'text-slate-900 dark:text-white' : ''}`}
                            style={!isPayment ? { color: config.amountColor } : undefined}
                        >
                            {config.prefix} {formatPrice(Math.abs(item?.amount ?? 0))}
                        </Text>
                        <View className={`${config.badgeBgClass} px-2 py-0.5 rounded-full mt-1`}>
                            <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                {config.label}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        } catch {
            return null;
        }
    };

    const ListHeader = () => (
        <>
            {/* Balance Card */}
            <View className="relative w-full overflow-hidden rounded-2xl bg-[#0d1c17] dark:bg-[#1a2c26] p-6 mb-5">
                <View className="absolute -right-5 -top-10 w-48 h-48 rounded-full bg-[#089166]/20 opacity-60" />
                <View className="absolute -left-5 -bottom-10 w-32 h-32 rounded-full bg-[#089166]/10 opacity-40" />
                <View className="relative z-10 items-center justify-center py-2">
                    <Text className="text-[#089166] text-xs font-semibold tracking-widest uppercase mb-2">
                        Tổng số dư
                    </Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-4xl font-extrabold text-white tracking-tight">
                            {formatPrice(user?.wallet_balance ?? 0).replace('₫', '')}
                        </Text>
                        <Text className="text-2xl font-bold text-[#089166] ml-1">₫</Text>
                    </View>
                    <View className="flex-row items-center gap-1 mt-2 opacity-50">
                        <MaterialIcons name="lock" size={14} color="white" />
                        <Text className="text-xs text-white">Ví bảo mật</Text>
                    </View>
                </View>
            </View>

            {/* Top Up Button */}
            <TouchableOpacity
                onPress={() => setShowTopup(true)}
                activeOpacity={0.85}
                className="w-full rounded-xl bg-[#089166] h-14 flex-row items-center justify-center mb-6"
                style={{
                    shadowColor: '#089166',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                <MaterialIcons name="add-card" size={22} color="#0d1c17" />
                <Text className="text-[#0d1c17] text-lg font-bold tracking-wide ml-2">
                    Nạp tiền ngay
                </Text>
            </TouchableOpacity>

            {/* Section Header */}
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-bold text-slate-900 dark:text-white">
                    Lịch sử giao dịch
                </Text>
            </View>

            {/* Loading state */}
            {loadingHistory && !refreshing && (
                <View className="items-center py-12">
                    <ActivityIndicator size="large" color="#089166" />
                    <Text className="text-sm text-slate-400 mt-3">Đang tải...</Text>
                </View>
            )}

            {/* Error state */}
            {historyError && !loadingHistory && (
                <View className="items-center py-12 px-4">
                    <MaterialIcons name="cloud-off" size={48} color="#94a3b8" />
                    <Text className="text-sm font-semibold text-slate-500 mt-3 text-center">
                        {historyError}
                    </Text>
                    <TouchableOpacity
                        onPress={() => { setLoadingHistory(true); fetchHistory(); }}
                        className="mt-4 bg-[#089166] px-6 py-2.5 rounded-xl"
                    >
                        <Text className="text-white font-bold text-sm">Thử lại</Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );

    const ListEmpty = () => {
        if (loadingHistory || historyError) return null;
        return (
            <View className="items-center py-16">
                <MaterialIcons name="receipt-long" size={56} color="#cbd5e1" />
                <Text className="text-base font-bold text-slate-400 mt-4">
                    Chưa có giao dịch nào
                </Text>
                <Text className="text-sm text-slate-400 mt-1">
                    Lịch sử giao dịch sẽ hiển thị ở đây
                </Text>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#f5f8f7] dark:bg-[#10221c]">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-4 py-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        hitSlop={8}
                        className="w-10 h-10 rounded-full items-center justify-center"
                    >
                        <MaterialIcons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white flex-1 text-center pr-10">
                        Ví của tôi
                    </Text>
                </View>

                {/* Content */}
                <FlatList
                    data={!loadingHistory && !historyError ? transactions : []}
                    keyExtractor={(item, index) => item?.transaction_id != null ? String(item.transaction_id) : `tx-${index}`}
                    renderItem={renderTransactionItem}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={ListEmpty}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#089166"
                            colors={['#089166']}
                        />
                    }
                />

                {/* Topup Modal */}
                <Modal
                    visible={showTopup}
                    animationType="slide"
                    transparent
                    onRequestClose={() => !processing && setShowTopup(false)}
                >
                    <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View className="bg-white dark:bg-[#10221c] rounded-t-3xl max-h-[88%]">
                            {/* Handle bar */}
                            <View className="items-center pt-3 pb-1">
                                <View className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                            >
                                {/* Modal Header */}
                                <View className="flex-row items-center justify-between mb-5 mt-2">
                                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                                        Nạp tiền vào ví
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => !processing && setShowTopup(false)}
                                        hitSlop={8}
                                        className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
                                    >
                                        <MaterialIcons name="close" size={18} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>

                                {/* Preset Amounts */}
                                <Text className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                                    Chọn số tiền
                                </Text>
                                <View className="flex-row flex-wrap gap-3 mb-5">
                                    {PRESET_AMOUNTS.map((value) => {
                                        const isSelected = amount === value;
                                        return (
                                            <TouchableOpacity
                                                key={value}
                                                onPress={() => { setAmount(value); setCustomAmount(''); }}
                                                className={`flex-1 min-w-[45%] py-3.5 rounded-xl items-center border ${
                                                    isSelected
                                                        ? 'bg-[#089166]/5 border-[#089166]'
                                                        : 'bg-white dark:bg-[#1a2c26] border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <Text className={`text-sm font-bold ${
                                                    isSelected ? 'text-[#089166]' : 'text-slate-900 dark:text-white'
                                                }`}>
                                                    {formatPrice(value)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Custom Amount */}
                                <Text className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                                    Hoặc nhập số tiền khác
                                </Text>
                                <TextInput
                                    value={customAmount}
                                    onChangeText={(text) => { setCustomAmount(text); setAmount(null); }}
                                    placeholder="Nhập số tiền (VNĐ)"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    className="bg-white dark:bg-[#1a2c26] rounded-xl p-4 text-slate-900 dark:text-white text-sm border border-slate-200 dark:border-slate-700 mb-5"
                                />

                                {/* Payment Method */}
                                <Text className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                                    Phương thức thanh toán
                                </Text>
                                <View className="gap-3 mb-6">
                                    {PAYMENT_METHODS.map(({ method, label, icon, desc }) => {
                                        const isSelected = method === paymentMethod;
                                        return (
                                            <TouchableOpacity
                                                key={method}
                                                onPress={() => setPaymentMethod(method)}
                                                className={`flex-row items-center p-4 rounded-xl border ${
                                                    isSelected
                                                        ? 'bg-[#089166]/5 border-[#089166]'
                                                        : 'bg-white dark:bg-[#1a2c26] border-slate-200 dark:border-slate-700'
                                                }`}
                                            >
                                                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                                                    isSelected ? 'bg-[#089166]/15' : 'bg-slate-100 dark:bg-slate-800'
                                                }`}>
                                                    <MaterialIcons name={icon} size={22} color={isSelected ? '#089166' : '#94a3b8'} />
                                                </View>
                                                <View className="flex-1 ml-3">
                                                    <Text className={`text-sm font-bold ${
                                                        isSelected ? 'text-[#089166]' : 'text-slate-900 dark:text-white'
                                                    }`}>
                                                        {label}
                                                    </Text>
                                                    <Text className="text-xs text-slate-400 mt-0.5">{desc}</Text>
                                                </View>
                                                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                                                    isSelected ? 'border-[#089166]' : 'border-slate-300 dark:border-slate-600'
                                                }`}>
                                                    {isSelected && <View className="w-2.5 h-2.5 rounded-full bg-[#089166]" />}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Confirm Button */}
                                <TouchableOpacity
                                    onPress={handleTopup}
                                    disabled={processing || getEffectiveAmount() <= 0}
                                    activeOpacity={0.85}
                                    className={`rounded-xl h-14 items-center flex-row justify-center gap-2 ${
                                        processing || getEffectiveAmount() <= 0
                                            ? 'bg-slate-300 dark:bg-slate-700'
                                            : 'bg-[#089166]'
                                    }`}
                                >
                                    {processing && <ActivityIndicator size="small" color="white" />}
                                    <Text className="text-white text-base font-bold">
                                        {processing
                                            ? 'Đang xử lý...'
                                            : getEffectiveAmount() > 0
                                                ? `Nạp ${formatPrice(getEffectiveAmount())}`
                                                : 'Nạp tiền'}
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </View>
    );
}
