import React from 'react';
import { Text, View } from 'react-native';
import { MatchStatus } from '../../types/matching';

const STATUS_CONFIG: Record<MatchStatus, { label: string; bg: string; text: string }> = {
    OPEN: { label: 'Đang mở', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
    MATCHED: { label: 'Đã ghép', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    CONFIRMED: { label: 'Đã xác nhận', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
    COMPLETED: { label: 'Hoàn thành', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
    CANCELLED: { label: 'Đã hủy', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    EXPIRED: { label: 'Hết hạn', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-500 dark:text-gray-500' },
};

type Props = {
    status: MatchStatus;
};

export function StatusBadge({ status }: Props) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;

    return (
        <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
            <Text className={`text-xs font-semibold ${config.text}`}>
                {config.label}
            </Text>
        </View>
    );
}
