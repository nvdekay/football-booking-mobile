import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MatchLevel, TeamMatching } from '../../../../types/matching';
import { LevelBadge } from './LevelBadge';

type Props = {
    matching: TeamMatching;
    onPress: (matching: TeamMatching) => void;
};

function formatTime(time: string): string {
    return time.substring(0, 5);
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.substring(0, 5).split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

function formatRelativeDate(dateStr: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchDate = new Date(dateStr);
    matchDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
        (matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    return matchDate.toLocaleDateString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
    });
}

const AVATAR_BORDER: Record<MatchLevel, string> = {
    VUI_VE: '#10B981',
    BAN_CHUYEN: '#93c5fd',
    CHUYEN_NGHIEP: '#fca5a5',
};

const AVATAR_BG: Record<MatchLevel, string> = {
    VUI_VE: '#d1fae5',
    BAN_CHUYEN: '#dbeafe',
    CHUYEN_NGHIEP: '#fee2e2',
};

export function MatchingCard({ matching, onPress }: Props) {
    return (
        <TouchableOpacity
            onPress={() => onPress(matching)}
            activeOpacity={0.7}
            className="mb-4 bg-white dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
            }}
        >
            {/* Top row: Avatar + Name + Level */}
            <View className="flex-row items-start justify-between mb-3">
                <View className="flex-row items-center gap-3">
                    <View
                        className="size-12 rounded-full items-center justify-center"
                        style={{
                            borderWidth: 2,
                            borderColor:
                                AVATAR_BORDER[matching.level] || AVATAR_BORDER.VUI_VE,
                            backgroundColor:
                                AVATAR_BG[matching.level] || AVATAR_BG.VUI_VE,
                        }}
                    >
                        <MaterialIcons name="person" size={24} color="#089166" />
                    </View>
                    <View>
                        <Text className="font-bold text-slate-900 dark:text-white">
                            {matching.host_name}
                        </Text>
                        <LevelBadge level={matching.level} />
                    </View>
                </View>
            </View>

            {/* Time & Location */}
            <View className="gap-2 mb-3">
                <View className="flex-row items-center">
                    <MaterialIcons
                        name="schedule"
                        size={20}
                        color="#22c55e"
                        style={{ marginRight: 8 }}
                    />
                    <Text className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {formatTime(matching.start_time)} -{' '}
                        {calculateEndTime(
                            matching.start_time,
                            matching.duration_minutes
                        )}{' '}
                        ({formatRelativeDate(matching.match_date)})
                    </Text>
                </View>
                {matching.field_name ? (
                    <View className="flex-row items-center">
                        <MaterialIcons
                            name="sports-soccer"
                            size={20}
                            color="#22c55e"
                            style={{ marginRight: 8 }}
                        />
                        <Text
                            className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1"
                            numberOfLines={1}
                        >
                            {matching.field_name}
                        </Text>
                    </View>
                ) : null}
            </View>

            {/* Description */}
            {matching.description ? (
                <Text
                    className="text-sm text-slate-600 dark:text-slate-400"
                    numberOfLines={2}
                    style={{ fontStyle: 'italic' }}
                >
                    &ldquo;{matching.description}&rdquo;
                </Text>
            ) : null}

            {/* Action buttons */}
            <View className="flex-row gap-2 mt-4">
                <TouchableOpacity
                    onPress={() => onPress(matching)}
                    className="flex-1 bg-primary rounded-lg items-center"
                    style={{
                        paddingVertical: 10,
                        shadowColor: '#089166',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                    activeOpacity={0.8}
                >
                    <Text className="text-sm font-bold text-white">
                        Tham gia ngay
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onPress(matching)}
                    className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg items-center justify-center"
                    style={{ paddingHorizontal: 12 }}
                    activeOpacity={0.7}
                >
                    <MaterialIcons name="chat" size={22} color="#089166" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}
