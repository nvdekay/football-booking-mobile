import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { MatchLevel } from '../../../../types/matching';

const LEVEL_CONFIG: Record<MatchLevel, { label: string; icon: keyof typeof MaterialIcons.glyphMap; color: string; bg: string; text: string }> = {
    VUI_VE: {
        label: 'Vui vẻ',
        icon: 'sentiment-satisfied',
        color: '#22c55e',
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-700 dark:text-green-400',
    },
    BAN_CHUYEN: {
        label: 'Bán chuyên',
        icon: 'sports-soccer',
        color: '#f59e0b',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-400',
    },
    CHUYEN_NGHIEP: {
        label: 'Chuyên nghiệp',
        icon: 'emoji-events',
        color: '#ef4444',
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
    },
};

type Props = {
    level: MatchLevel;
};

export function LevelBadge({ level }: Props) {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.VUI_VE;

    return (
        <View className={`flex-row items-center gap-1 px-2.5 py-1 rounded-full ${config.bg}`}>
            <MaterialIcons name={config.icon} size={14} color={config.color} />
            <Text className={`text-xs font-semibold ${config.text}`}>
                {config.label}
            </Text>
        </View>
    );
}
