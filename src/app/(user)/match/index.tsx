import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMatchings } from '../../../api/matching';
import { useAuth } from '../../../context/AuthContext';
import { MatchLevel, MatchingSearchParams, TeamMatching } from '../../../types/matching';
import { FilterBar } from './_components/FilterBar';
import { MatchingCard } from './_components/MatchingCard';

export default function MatchFeedScreen() {
    const router = useRouter();
    const { token } = useAuth();

    const [matchings, setMatchings] = useState<TeamMatching[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Filters
    const [selectedDate, setSelectedDate] = useState<string | undefined>();
    const [selectedLevel, setSelectedLevel] = useState<MatchLevel | undefined>();

    // Pagination
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchMatchings = useCallback(
        async (pageNum: number = 1, append: boolean = false) => {
            try {
                const params: MatchingSearchParams = {
                    page: pageNum,
                    limit: 15,
                };
                if (selectedDate) params.date = selectedDate;
                if (selectedLevel) params.level = selectedLevel;

                const response = await getMatchings(params, token ?? undefined);
                const { items, pagination } = response.data;

                if (append) {
                    setMatchings((prev) => [...prev, ...items]);
                } else {
                    setMatchings(items);
                }

                setPage(pagination.page);
                setHasMore(pagination.page < pagination.total_pages);
            } catch (err: any) {
                Alert.alert('Lỗi', err.message || 'Không thể tải danh sách kèo');
            }
        },
        [selectedDate, selectedLevel, token]
    );

    useFocusEffect(
        useCallback(() => {
            (async () => {
                setLoading(true);
                await fetchMatchings(1, false);
                setLoading(false);
            })();
        }, [fetchMatchings])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMatchings(1, false);
        setRefreshing(false);
    };

    const onEndReached = async () => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        await fetchMatchings(page + 1, true);
        setLoadingMore(false);
    };

    const handleMatchPress = (matching: TeamMatching) => {
        router.push(`/(user)/match/${matching.matching_id}` as any);
    };

    const handleCreatePress = () => {
        router.push('/(user)/match/create' as any);
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="bg-white dark:bg-background-dark border-b border-emerald-100 dark:border-emerald-900/30 px-4">
                    <View className="flex-row items-center justify-between py-4">
                        <View className="size-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                            <MaterialIcons name="search" size={22} color="#089166" />
                        </View>
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">
                            Tìm đối tác
                        </Text>
                        <TouchableOpacity className="relative size-10 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                            <MaterialIcons name="notifications" size={22} color="#089166" />
                            <View className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                        </TouchableOpacity>
                    </View>

                    {/* Date selector + Level filters */}
                    <FilterBar
                        selectedDate={selectedDate}
                        selectedLevel={selectedLevel}
                        onDateChange={setSelectedDate}
                        onLevelChange={setSelectedLevel}
                    />
                </View>

                {/* Content */}
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#089166" />
                    </View>
                ) : (
                    <FlatList
                        data={matchings}
                        keyExtractor={(item) => item.matching_id.toString()}
                        renderItem={({ item }) => (
                            <MatchingCard matching={item} onPress={handleMatchPress} />
                        )}
                        contentContainerStyle={{
                            paddingTop: 16,
                            paddingBottom: 100,
                            paddingHorizontal: 16,
                        }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor="#089166"
                                colors={['#089166']}
                            />
                        }
                        onEndReached={onEndReached}
                        onEndReachedThreshold={0.3}
                        ListFooterComponent={
                            loadingMore ? (
                                <View className="py-4">
                                    <ActivityIndicator size="small" color="#089166" />
                                </View>
                            ) : null
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20">
                                <MaterialIcons name="groups" size={64} color="#94a3b8" />
                                <Text className="text-base font-bold text-gray-500 dark:text-gray-400 mt-4">
                                    Chưa có kèo đấu nào
                                </Text>
                                <Text className="text-sm text-gray-400 mt-1">
                                    Hãy tạo kèo mới hoặc thay đổi bộ lọc!
                                </Text>
                            </View>
                        }
                    />
                )}

                {/* FAB - Create Match */}
                <TouchableOpacity
                    onPress={handleCreatePress}
                    className="absolute bottom-6 right-5 size-14 bg-primary rounded-full items-center justify-center z-30"
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                    activeOpacity={0.8}
                >
                    <MaterialIcons name="add" size={30} color="white" />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}
