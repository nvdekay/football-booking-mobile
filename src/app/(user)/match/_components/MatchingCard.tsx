import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TeamMatching } from '../../../../types/matching';
import { LevelBadge } from './LevelBadge';
import { StatusBadge } from './StatusBadge';

type Props = {
    matching: TeamMatching;
    onPress: (matching: TeamMatching) => void;
};

function formatTime(time: string): string {
    // time is "HH:mm:ss" or "HH:mm", return "HH:mm"
    return time.substring(0, 5);
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
}

export function MatchingCard({ matching, onPress }: Props) {
    return (
        <TouchableOpacity
            onPress={() => onPress(matching)}
            activeOpacity={0.7}
            className="mx-5 mb-3 bg-white dark:bg-[#1a2e26] rounded-2xl p-4 border border-slate-100 dark:border-slate-800"
        >
            {/* Top row: badges */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <StatusBadge status={matching.status} />
                    <LevelBadge level={matching.level} />
                </View>
                <Text className="text-xs text-slate-400">
                    {formatDate(matching.match_date)}
                </Text>
            </View>

            {/* Host info */}
            <View className="flex-row items-center gap-2 mb-2">
                <MaterialIcons name="person" size={18} color="#089166" />
                <Text className="text-sm font-semibold text-slate-800 dark:text-white">
                    {matching.host_name}
                </Text>
            </View>

            {/* Time */}
            <View className="flex-row items-center gap-2 mb-2">
                <MaterialIcons name="access-time" size={18} color="#089166" />
                <Text className="text-sm text-slate-600 dark:text-slate-400">
                    {formatTime(matching.start_time)} | {matching.duration_minutes} phút
                </Text>
            </View>

            {/* Field (if available) */}
            {matching.field_name && (
                <View className="flex-row items-center gap-2 mb-2">
                    <MaterialIcons name="location-on" size={18} color="#089166" />
                    <Text className="text-sm text-slate-600 dark:text-slate-400" numberOfLines={1}>
                        {matching.field_name}
                    </Text>
                </View>
            )}

            {/* Description preview */}
            {matching.description && (
                <Text className="text-xs text-slate-400 mt-1" numberOfLines={2}>
                    {matching.description}
                </Text>
            )}
        </TouchableOpacity>
    );
}
