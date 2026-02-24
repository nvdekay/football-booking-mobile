import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
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

function formatPrice(price: number): string {
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000];

const PAYMENT_METHODS: { method: 'VNPAY' | 'MOMO'; label: string; icon: keyof typeof MaterialIcons.glyphMap; desc: string }[] = [
    { method: 'VNPAY', label: 'VNPay', icon: 'credit-card', desc: 'Nạp qua VNPay' },
    { method: 'MOMO', label: 'MoMo', icon: 'phone-android', desc: 'Nạp qua MoMo' },
];

const TRANSACTION_CONFIG: Record<string, { icon: keyof typeof MaterialIcons.glyphMap; color: string; prefix: string }> = {
    PAYMENT: { icon: 'remove-circle', color: '#ef4444', prefix: '-' },
    DEPOSIT: { icon: 'add-circle', color: '#089166', prefix: '+' },
    REFUND: { icon: 'replay', color: '#089166', prefix: '+' },
};

export default function WalletScreen() {
    const { token, user, refreshUser } = useAuth();

    const [activeTab, setActiveTab] = useState<'topup' | 'history'>('topup');

    // Top-up state
    const [amount, setAmount] = useState<number | null>(null);
    const [customAmount, setCustomAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'VNPAY' | 'MOMO'>('VNPAY');
    const [processing, setProcessing] = useState(false);

    // History state
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        refreshUser().catch(() => {});
    }, []);

    const fetchHistory = useCallback(async () => {
        if (!token) return;
        try {
            const response = await getWalletHistory(token);
            setTransactions(response.data);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể tải lịch sử giao dịch');
        }
    }, [token]);

    useEffect(() => {
        if (activeTab === 'history') {
            setLoadingHistory(true);
            fetchHistory().finally(() => setLoadingHistory(false));
        }
    }, [activeTab, fetchHistory]);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchHistory(), refreshUser().catch(() => {})]);
        setRefreshing(false);
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

            if (response.data.payment_url) {
                await WebBrowser.openBrowserAsync(response.data.payment_url);
                try {
                    await refreshUser();
                } catch {
                    // Context may be temporarily unavailable after browser
                }
                Alert.alert('Thông báo', 'Vui lòng kiểm tra số dư ví sau khi thanh toán');
            }
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Nạp tiền thất bại');
        } finally {
            setProcessing(false);
        }
    };

    const handleSelectPreset = (value: number) => {
        setAmount(value);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (text: string) => {
        setCustomAmount(text);
        setAmount(null);
    };

    const renderTransactionItem = ({ item }: { item: WalletTransaction }) => {
        const config = TRANSACTION_CONFIG[item.type] || TRANSACTION_CONFIG.PAYMENT;
        return (
            <View className="flex-row items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                    item.type === 'PAYMENT' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'
                }`}>
                    <MaterialIcons name={config.icon} size={22} color={config.color} />
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-slate-900 dark:text-white" numberOfLines={1}>
                        {item.description}
                    </Text>
                    <Text className="text-xs text-slate-400 mt-0.5">
                        {formatDate(item.created_at)}
                    </Text>
                </View>
                <Text className="text-sm font-bold" style={{ color: config.color }}>
                    {config.prefix}{formatPrice(item.amount)}
                </Text>
            </View>
        );
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
                        Ví của tôi
                    </Text>
                </View>

                {/* Balance card */}
                <View className="mx-5 bg-[#10221c] rounded-2xl p-5 relative overflow-hidden">
                    <View className="absolute top-0 right-0 w-32 h-32 bg-[#0df2aa]/10 rounded-full -mr-16 -mt-16" />
                    <Text className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                        Số dư ví
                    </Text>
                    <Text className="text-white text-3xl font-bold mt-2">
                        {formatPrice(user?.wallet_balance ?? 0)}
                    </Text>
                </View>

                {/* Tab switcher */}
                <View className="flex-row mx-5 mt-4 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <TouchableOpacity
                        onPress={() => setActiveTab('topup')}
                        className={`flex-1 py-2.5 rounded-lg items-center ${
                            activeTab === 'topup' ? 'bg-white dark:bg-[#1a2e26] shadow-sm' : ''
                        }`}
                    >
                        <Text className={`text-sm font-bold ${
                            activeTab === 'topup' ? 'text-primary' : 'text-slate-400'
                        }`}>
                            Nạp tiền
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('history')}
                        className={`flex-1 py-2.5 rounded-lg items-center ${
                            activeTab === 'history' ? 'bg-white dark:bg-[#1a2e26] shadow-sm' : ''
                        }`}
                    >
                        <Text className={`text-sm font-bold ${
                            activeTab === 'history' ? 'text-primary' : 'text-slate-400'
                        }`}>
                            Lịch sử
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab content */}
                {activeTab === 'topup' ? (
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        {/* Preset amounts */}
                        <View className="mx-5 mt-4">
                            <Text className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                                Chọn số tiền
                            </Text>
                            <View className="flex-row flex-wrap gap-3">
                                {PRESET_AMOUNTS.map((value) => (
                                    <TouchableOpacity
                                        key={value}
                                        onPress={() => handleSelectPreset(value)}
                                        className={`flex-1 min-w-[45%] py-3 rounded-xl items-center border ${
                                            amount === value
                                                ? 'bg-primary/5 border-primary'
                                                : 'bg-white dark:bg-[#1a2e26] border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <Text className={`text-sm font-bold ${
                                            amount === value ? 'text-primary' : 'text-slate-900 dark:text-white'
                                        }`}>
                                            {formatPrice(value)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Custom amount */}
                        <View className="mx-5 mt-4">
                            <Text className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                                Hoặc nhập số tiền khác
                            </Text>
                            <TextInput
                                value={customAmount}
                                onChangeText={handleCustomAmountChange}
                                placeholder="Nhập số tiền (VNĐ)"
                                placeholderTextColor="#94a3b8"
                                keyboardType="numeric"
                                className="bg-white dark:bg-[#1a2e26] rounded-xl p-4 text-slate-900 dark:text-white text-sm border border-slate-200 dark:border-slate-700"
                            />
                        </View>

                        {/* Payment method */}
                        <View className="mx-5 mt-5">
                            <Text className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                                Phương thức thanh toán
                            </Text>
                            <View className="gap-3">
                                {PAYMENT_METHODS.map(({ method, label, icon, desc }) => {
                                    const isSelected = method === paymentMethod;
                                    return (
                                        <TouchableOpacity
                                            key={method}
                                            onPress={() => setPaymentMethod(method)}
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
                                                <Text className={`text-sm font-bold ${
                                                    isSelected ? 'text-primary' : 'text-slate-900 dark:text-white'
                                                }`}>
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
                ) : (
                    /* History tab */
                    loadingHistory ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#089166" />
                        </View>
                    ) : (
                        <FlatList
                            data={transactions}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderTransactionItem}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 }}
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
                                    <MaterialIcons name="receipt-long" size={64} color="#94a3b8" />
                                    <Text className="text-base font-bold text-gray-500 dark:text-gray-400 mt-4">
                                        Chưa có giao dịch nào
                                    </Text>
                                    <Text className="text-sm text-gray-400 mt-1">
                                        Lịch sử giao dịch sẽ hiển thị ở đây
                                    </Text>
                                </View>
                            }
                        />
                    )
                )}

                {/* Bottom CTA for topup tab */}
                {activeTab === 'topup' && (
                    <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d1c17] border-t border-slate-100 dark:border-slate-800 px-5 pb-8 pt-4">
                        <TouchableOpacity
                            onPress={handleTopup}
                            disabled={processing || getEffectiveAmount() <= 0}
                            className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${
                                processing || getEffectiveAmount() <= 0
                                    ? 'bg-slate-300 dark:bg-slate-700'
                                    : 'bg-primary'
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
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
