import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

function formatPrice(price: number | null | undefined): string {
    if (price == null || isNaN(price)) return '0₫';
    return Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

interface WalletCardProps {
    balance: number;
    onTopup: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ balance, onTopup }) => {
    return (
        <View className="px-4 pb-5">
            <View className="relative overflow-hidden rounded-2xl bg-[#0d1c17] p-5">
                {/* Decorative circles */}
                <View className="absolute -right-5 -top-10 w-48 h-48 rounded-full bg-[#089166]/20 opacity-60" />
                <View className="absolute -left-5 -bottom-10 w-32 h-32 rounded-full bg-[#089166]/10 opacity-40" />

                <View className="relative z-10 flex-row items-center justify-between">
                    <View className="flex flex-col gap-1.5">
                        <Text className="text-[#089166] text-xs font-semibold uppercase tracking-widest">
                            Số dư ví
                        </Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-white text-3xl font-extrabold leading-none">
                                {formatPrice(balance).replace('₫', '')}
                            </Text>
                            <Text className="text-xl font-bold text-[#089166] ml-0.5">₫</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={onTopup}
                        activeOpacity={0.85}
                        className="flex-row items-center justify-center rounded-xl h-11 px-5 bg-[#089166] gap-2"
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#0d1c17" />
                        <Text className="text-[#0d1c17] font-bold text-sm">Nạp tiền</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};
