import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export const WalletCard: React.FC = () => {
    return (
        <View className="px-6 pb-6">
            <View className="flex-row items-center justify-between gap-4 rounded-xl bg-[#10221c] p-5 shadow-lg relative overflow-hidden">
                {/* Abstract decorative background */}
                <View className="absolute top-0 right-0 w-32 h-32 bg-[#0df2aa]/10 rounded-full -mr-16 -mt-16" />

                <View className="flex flex-col gap-2 relative z-10">
                    <Text className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                        Available Balance
                    </Text>
                    <Text className="text-white text-3xl font-bold leading-none">
                        ฿ 1,250.00
                    </Text>
                </View>

                <TouchableOpacity className="flex-row items-center justify-center rounded-lg h-11 px-5 bg-[#0df2aa] gap-2 z-10">
                    <Ionicons name="add-circle-outline" size={20} color="#10221c" />
                    <Text className="text-[#10221c] font-bold text-sm">Top-up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};
