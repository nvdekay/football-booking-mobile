import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    cancelMatching,
    confirmMatching,
    getMatchingById,
    joinMatching,
    leaveMatching,
} from '../../../api/matching';
import { useAuth } from '../../../context/AuthContext';
import { MatchParticipant, TeamMatchingDetail } from '../../../types/matching';
import { LevelBadge } from './_components/LevelBadge';
import { StatusBadge } from './_components/StatusBadge';

function formatTime(time: string): string {
    return time.substring(0, 5);
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function MatchDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { token, user } = useAuth();

    const [matching, setMatching] = useState<TeamMatchingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showCancelInput, setShowCancelInput] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!token || !id) return;
        try {
            const response = await getMatchingById(parseInt(id), token);
            setMatching(response.data);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể tải chi tiết kèo');
        }
    }, [id, token]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            await fetchDetail();
            setLoading(false);
        })();
    }, [fetchDetail]);

    const handleAction = async (action: () => Promise<any>, successMsg: string) => {
        setActionLoading(true);
        try {
            await action();
            Alert.alert('Thành công', successMsg);
            await fetchDetail();
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = () => {
        Alert.alert('Xác nhận', 'Bạn muốn tham gia kèo đấu này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Tham gia',
                onPress: () =>
                    handleAction(
                        () => joinMatching(parseInt(id), token!),
                        'Đã tham gia kèo đấu!'
                    ),
            },
        ]);
    };

    const handleLeave = () => {
        Alert.alert('Xác nhận', 'Bạn muốn rời kèo đấu này?', [
            { text: 'Không', style: 'cancel' },
            {
                text: 'Rời kèo',
                style: 'destructive',
                onPress: () =>
                    handleAction(
                        () => leaveMatching(parseInt(id), token!),
                        'Đã rời kèo đấu'
                    ),
            },
        ]);
    };

    const handleConfirm = () => {
        Alert.alert('Xác nhận', 'Xác nhận tham gia trận đấu này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xác nhận',
                onPress: () =>
                    handleAction(
                        () => confirmMatching(parseInt(id), token!),
                        'Đã xác nhận!'
                    ),
            },
        ]);
    };

    const handleCancel = () => {
        if (!showCancelInput) {
            setShowCancelInput(true);
            return;
        }
        handleAction(
            () => cancelMatching(parseInt(id), cancelReason || undefined, token!),
            'Đã hủy kèo đấu'
        );
        setShowCancelInput(false);
        setCancelReason('');
    };

    const handleCall = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    if (loading) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <ActivityIndicator size="large" color="#089166" />
            </View>
        );
    }

    if (!matching) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <Text className="text-slate-500">Không tìm thấy kèo đấu</Text>
            </View>
        );
    }

    const userId = user?.id;
    const isHost = matching.host_id === userId;
    const myParticipant = matching.participants.find(
        (p: MatchParticipant) => p.user_id === userId
    );
    const isChallenger = myParticipant?.role === 'CHALLENGER';
    const isParticipant = !!myParticipant;

    const hostParticipant = matching.participants.find(
        (p: MatchParticipant) => p.role === 'HOST'
    );
    const challengerParticipant = matching.participants.find(
        (p: MatchParticipant) => p.role === 'CHALLENGER'
    );

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 gap-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color="#089166" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white flex-1">
                        Chi tiết kèo đấu
                    </Text>
                    <StatusBadge status={matching.status} />
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Match Info */}
                    <View className="mx-5 bg-white dark:bg-[#1a2e26] rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-base font-bold text-slate-900 dark:text-white">
                                Thông tin trận đấu
                            </Text>
                            <LevelBadge level={matching.level} />
                        </View>

                        <View className="gap-2.5">
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="event" size={18} color="#089166" />
                                <Text className="text-sm text-slate-600 dark:text-slate-400">
                                    {formatDate(matching.match_date)}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="access-time" size={18} color="#089166" />
                                <Text className="text-sm text-slate-600 dark:text-slate-400">
                                    {formatTime(matching.start_time)} | {matching.duration_minutes} phút
                                </Text>
                            </View>
                            {matching.field_name && (
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="location-on" size={18} color="#089166" />
                                    <Text className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                                        {matching.field_name}
                                        {matching.field_address ? ` - ${matching.field_address}` : ''}
                                    </Text>
                                </View>
                            )}
                            {matching.description && (
                                <View className="flex-row items-start gap-2">
                                    <MaterialIcons name="notes" size={18} color="#089166" />
                                    <Text className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                                        {matching.description}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Host Info */}
                    <View className="mx-5 mt-4 bg-white dark:bg-[#1a2e26] rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                        <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                            Chủ kèo
                        </Text>
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                                    <MaterialIcons name="person" size={22} color="#089166" />
                                </View>
                                <View>
                                    <Text className="text-sm font-semibold text-slate-800 dark:text-white">
                                        {matching.host_name}
                                    </Text>
                                    <Text className="text-xs text-slate-400">
                                        {matching.host_phone}
                                    </Text>
                                </View>
                            </View>
                            {hostParticipant && (
                                <View className="flex-row items-center gap-2">
                                    {matching.host_confirmed && (
                                        <MaterialIcons name="check-circle" size={20} color="#089166" />
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleCall(matching.host_phone)}
                                        className="bg-primary/10 rounded-full p-2"
                                    >
                                        <MaterialIcons name="phone" size={18} color="#089166" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Challenger Info */}
                    {challengerParticipant && (
                        <View className="mx-5 mt-4 bg-white dark:bg-[#1a2e26] rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                            <Text className="text-base font-bold text-slate-900 dark:text-white mb-3">
                                Đối thủ
                            </Text>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center gap-2">
                                    <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center">
                                        <MaterialIcons name="person" size={22} color="#3b82f6" />
                                    </View>
                                    <View>
                                        <Text className="text-sm font-semibold text-slate-800 dark:text-white">
                                            {challengerParticipant.full_name}
                                        </Text>
                                        <Text className="text-xs text-slate-400">
                                            {challengerParticipant.phone_number}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    {matching.challenger_confirmed && (
                                        <MaterialIcons name="check-circle" size={20} color="#089166" />
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleCall(challengerParticipant.phone_number)}
                                        className="bg-blue-500/10 rounded-full p-2"
                                    >
                                        <MaterialIcons name="phone" size={18} color="#3b82f6" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Cancel reason input */}
                    {showCancelInput && (
                        <View className="mx-5 mt-4">
                            <TextInput
                                placeholder="Lý do hủy (không bắt buộc)"
                                placeholderTextColor="#94a3b8"
                                value={cancelReason}
                                onChangeText={setCancelReason}
                                className="bg-white dark:bg-[#1a2e26] rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white border border-slate-100 dark:border-slate-800"
                                multiline
                            />
                        </View>
                    )}

                    <View className="h-32" />
                </ScrollView>

                {/* Action Buttons */}
                <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d1c17] border-t border-slate-100 dark:border-slate-800 px-5 pb-8 pt-4">
                    {actionLoading ? (
                        <View className="items-center py-3">
                            <ActivityIndicator size="small" color="#089166" />
                        </View>
                    ) : (
                        <View className="gap-2">
                            {/* Join button: not participant & OPEN */}
                            {!isParticipant && matching.status === 'OPEN' && (
                                <TouchableOpacity
                                    onPress={handleJoin}
                                    className="bg-primary rounded-xl py-4 items-center"
                                >
                                    <Text className="text-white text-base font-bold">
                                        Tham gia kèo
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Confirm button: participant & MATCHED & not yet confirmed */}
                            {isParticipant && matching.status === 'MATCHED' && !myParticipant?.confirmed && (
                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    className="bg-primary rounded-xl py-4 items-center"
                                >
                                    <Text className="text-white text-base font-bold">
                                        Xác nhận trận đấu
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Already confirmed indicator */}
                            {isParticipant && matching.status === 'MATCHED' && myParticipant?.confirmed && (
                                <View className="bg-primary/10 rounded-xl py-4 items-center flex-row justify-center gap-2">
                                    <MaterialIcons name="check-circle" size={20} color="#089166" />
                                    <Text className="text-primary text-base font-bold">
                                        Đã xác nhận - Chờ đối phương
                                    </Text>
                                </View>
                            )}

                            {/* Leave button: challenger & MATCHED */}
                            {isChallenger && matching.status === 'MATCHED' && (
                                <TouchableOpacity
                                    onPress={handleLeave}
                                    className="border border-red-300 dark:border-red-700 rounded-xl py-4 items-center"
                                >
                                    <Text className="text-red-500 text-base font-bold">
                                        Rời kèo
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Edit button: host & OPEN */}
                            {isHost && matching.status === 'OPEN' && (
                                <TouchableOpacity
                                    onPress={() =>
                                        router.push({
                                            pathname: '/(user)/match/create' as any,
                                            params: { editId: matching.matching_id.toString() },
                                        })
                                    }
                                    className="border border-primary rounded-xl py-4 items-center"
                                >
                                    <Text className="text-primary text-base font-bold">
                                        Chỉnh sửa
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Cancel button: host OPEN, or participant MATCHED/CONFIRMED */}
                            {((isHost && ['OPEN', 'MATCHED', 'CONFIRMED'].includes(matching.status)) ||
                                (isChallenger && ['MATCHED', 'CONFIRMED'].includes(matching.status))) && (
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    className="bg-red-500 rounded-xl py-4 items-center"
                                >
                                    <Text className="text-white text-base font-bold">
                                        {showCancelInput ? 'Xác nhận hủy' : 'Hủy kèo'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
