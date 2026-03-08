import React from 'react';
import { Text, View } from 'react-native';
import { MatchLevel } from '../../types/matching';

const LEVEL_CONFIG: Record<MatchLevel, { label: string; bg: string; text: string }> = {
    VUI_VE: {
        label: 'Vui vẻ',
        bg: 'bg-emerald-100',
        text: 'text-primary',
    },
    BAN_CHUYEN: {
        label: 'Bán chuyên',
        bg: 'bg-blue-100',
        text: 'text-blue-600',
    },
    CHUYEN_NGHIEP: {
        label: 'Chuyên nghiệp',
        bg: 'bg-red-100',
        text: 'text-red-600',
    },
};

type Props = {
    level: MatchLevel;
};

export function LevelBadge({ level }: Props) {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.VUI_VE;

    return (
        <View className={`self-start px-2 py-0.5 rounded mt-1 ${config.bg}`}>
            <Text
                className={`font-bold uppercase ${config.text}`}
                style={{ fontSize: 10, letterSpacing: 0.5 }}
            >
                {config.label}
            </Text>
        </View>
    );
}
