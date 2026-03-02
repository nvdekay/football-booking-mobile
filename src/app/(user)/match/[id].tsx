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

import { createPrivateConversation } from '../../../api/chat';
import {
    acceptChallenger,
    cancelMatching,
    confirmMatching,
    getMatchingById,
    joinMatching,
    leaveMatching,
    rejectChallenger,
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
        Alert.alert('Xác nhận', 'Gửi yêu cầu tham gia kèo đấu này? Chủ kèo sẽ duyệt yêu cầu của bạn.', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Gửi yêu cầu',
                onPress: () =>
                    handleAction(
                        () => joinMatching(parseInt(id), token!),
                        'Đã gửi yêu cầu tham gia! Chờ chủ kèo chấp nhận.'
                    ),
            },
        ]);
    };

    const handleAccept = () => {
        Alert.alert('Chấp nhận đối thủ', 'Bạn muốn chấp nhận đối thủ này vào kèo?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Chấp nhận',
                onPress: () =>
                    handleAction(
                        () => acceptChallenger(parseInt(id), token!),
                        'Đã chấp nhận đối thủ!'
                    ),
            },
        ]);
    };

    const handleReject = () => {
        Alert.alert('Từ chối đối thủ', 'Bạn muốn từ chối đối thủ này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Từ chối',
                style: 'destructive',
                onPress: () =>
                    handleAction(
                        () => rejectChallenger(parseInt(id), token!),
                        'Đã từ chối đối thủ'
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

    const [chatLoading, setChatLoading] = useState(false);

    const handleChat = async (targetUserId: number) => {
        if (!token) return;
        setChatLoading(true);
        try {
            const res = await createPrivateConversation(token, targetUserId);
            router.push(`/(user)/chat/${res.data.conversation_id}` as any);
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể tạo cuộc trò chuyện');
        } finally {
            setChatLoading(false);
        }
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

    const challengerParticipant = matching.participants.find(
        (p: MatchParticipant) => p.role === 'CHALLENGER'
    );

    // Pending challenger = there's a CHALLENGER while status is still OPEN
    const hasPendingChallenger = matching.status === 'OPEN' && !!challengerParticipant;

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
                            {matching.field_name ? (
                                <View className="flex-row items-center gap-2">
                                    <MaterialIcons name="location-on" size={18} color="#089166" />
                                    <Text className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                                        {matching.field_name}
                                        {matching.field_address ? ` - ${matching.field_address}` : ''}
                                    </Text>
                                </View>
                            ) : null}
                            {matching.description ? (
                                <View className="flex-row items-start gap-2">
                                    <MaterialIcons name="notes" size={18} color="#089166" />
                                    <Text className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                                        {matching.description}
                                    </Text>
                                </View>
                            ) : null}
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
                            <View className="flex-row items-center gap-2">
                                {!!matching.host_confirmed && (
                                    <MaterialIcons name="check-circle" size={20} color="#089166" />
                                )}
                                {!isHost && (
                                    <TouchableOpacity
                                        onPress={() => handleChat(matching.host_id)}
                                        disabled={chatLoading}
                                        className="bg-primary/10 rounded-full p-2"
                                    >
                                        <MaterialIcons name="chat" size={18} color="#089166" />
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => handleCall(matching.host_phone)}
                                    className="bg-primary/10 rounded-full p-2"
                                >
                                    <MaterialIcons name="phone" size={18} color="#089166" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Challenger Info / Pending Request */}
                    {challengerParticipant ? (
                        <View className="mx-5 mt-4 bg-white dark:bg-[#1a2e26] rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-base font-bold text-slate-900 dark:text-white">
                                    {hasPendingChallenger ? 'Yêu cầu tham gia' : 'Đối thủ'}
                                </Text>
                                {hasPendingChallenger && (
                                    <View className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30">
                                        <Text className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                                            Chờ duyệt
                                        </Text>
                                    </View>
                                )}
                            </View>
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
                                    {!!matching.challenger_confirmed && (
                                        <MaterialIcons name="check-circle" size={20} color="#089166" />
                                    )}
                                    {isHost && (
                                        <TouchableOpacity
                                            onPress={() => handleChat(challengerParticipant.user_id)}
                                            disabled={chatLoading}
                                            className="bg-blue-500/10 rounded-full p-2"
                                        >
                                            <MaterialIcons name="chat" size={18} color="#3b82f6" />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleCall(challengerParticipant.phone_number)}
                                        className="bg-blue-500/10 rounded-full p-2"
                                    >
                                        <MaterialIcons name="phone" size={18} color="#3b82f6" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Host accept/reject buttons for pending challenger */}
                            {isHost && hasPendingChallenger && (
                                <View className="flex-row gap-3 mt-4">
                                    <TouchableOpacity
                                        onPress={handleReject}
                                        disabled={actionLoading}
                                        className="flex-1 border border-red-300 dark:border-red-700 rounded-xl py-3 items-center"
                                    >
                                        <Text className="text-red-500 text-sm font-bold">
                                            Từ chối
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleAccept}
                                        disabled={actionLoading}
                                        className="flex-1 bg-primary rounded-xl py-3 items-center"
                                    >
                                        <Text className="text-white text-sm font-bold">
                                            Chấp nhận
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ) : null}

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
                            {/* Join button: not participant & not host & OPEN & no pending challenger */}
                            {!isParticipant && !isHost && matching.status === 'OPEN' && !hasPendingChallenger && (
                                <TouchableOpacity
                                    onPress={handleJoin}
                                    className="bg-primary rounded-xl py-4 items-center"
                                >
                                    <Text className="text-white text-base font-bold">
                                        Gửi yêu cầu tham gia
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Challenger pending indicator */}
                            {isChallenger && matching.status === 'OPEN' && (
                                <View className="bg-amber-50 dark:bg-amber-900/20 rounded-xl py-4 items-center flex-row justify-center gap-2">
                                    <MaterialIcons name="hourglass-top" size={20} color="#f59e0b" />
                                    <Text className="text-amber-700 dark:text-amber-400 text-base font-bold">
                                        Đang chờ chủ kèo duyệt
                                    </Text>
                                </View>
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
                            {isParticipant && matching.status === 'MATCHED' && !!myParticipant?.confirmed && (
                                <View className="bg-primary/10 rounded-xl py-4 items-center flex-row justify-center gap-2">
                                    <MaterialIcons name="check-circle" size={20} color="#089166" />
                                    <Text className="text-primary text-base font-bold">
                                        Đã xác nhận - Chờ đối phương
                                    </Text>
                                </View>
                            )}

                            {/* Leave button: challenger & (OPEN pending or MATCHED) */}
                            {isChallenger && ['OPEN', 'MATCHED'].includes(matching.status) && (
                                <TouchableOpacity
                                    onPress={handleLeave}
                                    className="border border-red-300 dark:border-red-700 rounded-xl py-4 items-center"
                                >
                                    <Text className="text-red-500 text-base font-bold">
                                        Rời kèo
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {/* Edit button: host & OPEN & no pending challenger */}
                            {isHost && matching.status === 'OPEN' && !hasPendingChallenger && (
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

                            {/* Cancel button: host OPEN/MATCHED/CONFIRMED, or challenger MATCHED/CONFIRMED */}
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
