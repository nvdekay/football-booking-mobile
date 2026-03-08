import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface MenuItemProps {
    icon: string;
    title: string;
    subtitle: string;
    onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center gap-4 bg-white px-2 py-3.5 rounded-xl active:bg-[#f5f8f7]"
    >
        <View className="text-emerald-600 items-center justify-center rounded-lg bg-[#0df2aa]/10 w-11 h-11">
            <Ionicons name={icon as any} size={24} color="#059669" />
        </View>
        <View className="flex-col items-start flex-1 min-w-0">
            <Text className="text-base font-semibold text-[#111816]" numberOfLines={1}>
                {title}
            </Text>
            <Text className="text-xs text-slate-500" numberOfLines={1}>
                {subtitle}
            </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
);

interface MenuListProps {
    onSettings?: () => void;
    onTransactionHistory?: () => void;
    onPersonalInfo?: () => void;
}

export const MenuList: React.FC<MenuListProps> = ({ onSettings, onTransactionHistory, onPersonalInfo }) => {
    return (
        <View className="flex flex-col px-4 gap-1">
            <Text className="px-2 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Cài đặt tài khoản
            </Text>

            <MenuItem
                icon="person-outline"
                title="Thông tin cá nhân"
                subtitle="Quản lý thông tin tài khoản"
                onPress={onPersonalInfo}
            />

            <MenuItem
                icon="receipt-outline"
                title="Lịch sử giao dịch"
                subtitle="Xem thanh toán và nạp tiền"
                onPress={onTransactionHistory}
            />

            <MenuItem
                icon="football-outline"
                title="Trận đấu của tôi"
                subtitle="Lịch đặt sắp tới và đã qua"
            />

            <MenuItem
                icon="notifications-outline"
                title="Thông báo"
                subtitle="Cảnh báo, cập nhật và nhắc nhở"
            />

            <MenuItem
                icon="options-outline"
                title="Cài đặt ứng dụng"
                subtitle="Ngôn ngữ, giao diện và quyền riêng tư"
                onPress={onSettings}
            />
        </View>
    );
};
