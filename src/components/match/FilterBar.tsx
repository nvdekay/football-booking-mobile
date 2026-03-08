import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MatchLevel } from '../../types/matching';

const LEVELS: { value: MatchLevel; label: string }[] = [
    { value: 'VUI_VE', label: 'Vui vẻ' },
    { value: 'BAN_CHUYEN', label: 'Bán chuyên' },
    { value: 'CHUYEN_NGHIEP', label: 'Chuyên nghiệp' },
];

type DateChip = {
    topLabel: string;
    day: number;
    bottomLabel: string;
    value: string;
};

type Props = {
    selectedDate: string | undefined;
    selectedLevel: MatchLevel | undefined;
    onDateChange: (date: string | undefined) => void;
    onLevelChange: (level: MatchLevel | undefined) => void;
};

function generateDateChips(): DateChip[] {
    const today = new Date();
    const dayAbbr = ['CN', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7'];
    const chips: DateChip[] = [];

    for (let i = 0; i < 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        let topLabel: string;
        if (i === 0) topLabel = 'Hôm nay';
        else if (i === 1) topLabel = 'Ngày mai';
        else {
            const dow = date.getDay();
            if (dow === 0) topLabel = 'Chủ nhật';
            else topLabel = `Thứ ${dow + 1}`;
        }

        chips.push({
            topLabel,
            day: date.getDate(),
            bottomLabel: dayAbbr[date.getDay()],
            value: date.toISOString().split('T')[0],
        });
    }
    return chips;
}

export function FilterBar({ selectedDate, selectedLevel, onDateChange, onLevelChange }: Props) {
    const dateChips = useMemo(() => generateDateChips(), []);

    const handleDatePress = (value: string) => {
        onDateChange(selectedDate === value ? undefined : value);
    };

    const handleLevelPress = (value: MatchLevel) => {
        onLevelChange(selectedLevel === value ? undefined : value);
    };

    return (
        <View className="pb-4">
            {/* Date chips - horizontal scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12, paddingBottom: 8 }}
            >
                {dateChips.map((chip) => {
                    const isActive = selectedDate === chip.value;
                    return (
                        <TouchableOpacity
                            key={chip.value}
                            onPress={() => handleDatePress(chip.value)}
                            className={`items-center justify-center rounded-2xl ${
                                isActive
                                    ? 'bg-primary'
                                    : 'bg-emerald-50 dark:bg-emerald-900/20'
                            }`}
                            style={[
                                { minWidth: 60, height: 80 },
                                isActive && {
                                    shadowColor: '#089166',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 8,
                                    elevation: 4,
                                },
                            ]}
                        >
                            <Text
                                className={`font-medium uppercase ${
                                    isActive ? 'text-white/80' : 'text-slate-500 dark:text-emerald-400'
                                }`}
                                style={{ fontSize: 10 }}
                            >
                                {chip.topLabel}
                            </Text>
                            <Text
                                className={`text-lg font-bold ${
                                    isActive ? 'text-white' : 'text-slate-600 dark:text-emerald-400'
                                }`}
                            >
                                {chip.day}
                            </Text>
                            <Text
                                className={`font-medium uppercase ${
                                    isActive ? 'text-white/80' : 'text-slate-500 dark:text-emerald-400'
                                }`}
                                style={{ fontSize: 10 }}
                            >
                                {chip.bottomLabel}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Level filter chips */}
            <View className="flex-row flex-wrap gap-2 mt-4">
                {LEVELS.map((item) => {
                    const isActive = selectedLevel === item.value;
                    return (
                        <TouchableOpacity
                            key={item.label}
                            onPress={() => handleLevelPress(item.value)}
                            className={`px-4 rounded-full border ${
                                isActive
                                    ? 'bg-emerald-100 dark:bg-emerald-900/40 border-primary/20'
                                    : 'bg-slate-50 dark:bg-emerald-950/20 border-slate-200 dark:border-emerald-900/30'
                            }`}
                            style={{ paddingVertical: 6 }}
                        >
                            <Text
                                className={`text-sm ${
                                    isActive
                                        ? 'font-semibold text-primary'
                                        : 'font-medium text-slate-500 dark:text-emerald-700'
                                }`}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}
