import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAvailability } from '../../../api/field';
import { TimeSlot } from '../../../types/booking';

const DURATIONS = [60, 90, 120];

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function generateDates(count: number): { date: string; dayLabel: string; dayNum: string; monthLabel: string }[] {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
    const result = [];
    for (let i = 0; i < count; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        result.push({
            date: d.toISOString().split('T')[0],
            dayLabel: days[d.getDay()],
            dayNum: d.getDate().toString(),
            monthLabel: months[d.getMonth()],
        });
    }
    return result;
}

function formatTime(time: string): string {
    return time.substring(0, 5);
}

function formatPrice(price: number): string {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫';
}

export default function AvailabilityScreen() {
    const { fieldId, fieldName, fieldAddress, pricePerHour } = useLocalSearchParams<{
        fieldId: string;
        fieldName: string;
        fieldAddress: string;
        pricePerHour: string;
    }>();
    const router = useRouter();

    const dates = useMemo(() => generateDates(14), []);
    const [selectedDate, setSelectedDate] = useState(getTodayString());
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStartSlot, setSelectedStartSlot] = useState<string | null>(null);
    const [duration, setDuration] = useState(60);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const response = await getAvailability(Number(fieldId), selectedDate);
                let fetchedSlots = response.data.slots;

                // Client-side safety: filter out past slots for today
                if (selectedDate === getTodayString()) {
                    const currentHour = new Date().getHours();
                    fetchedSlots = fetchedSlots.filter((slot) => {
                        const slotHour = parseInt(slot.start.substring(0, 2), 10);
                        return slotHour > currentHour;
                    });
                }

                setSlots(fetchedSlots);
                setSelectedStartSlot(null);
            } catch (err: any) {
                Alert.alert('Lỗi', err.message || 'Không thể tải lịch trống');
            } finally {
                setLoading(false);
            }
        })();
    }, [fieldId, selectedDate]);

    const slotsNeeded = duration / 60;

    const canSelectSlot = (slotIndex: number): boolean => {
        for (let i = 0; i < Math.ceil(slotsNeeded); i++) {
            const idx = slotIndex + i;
            if (idx >= slots.length) return false;
            if (slots[idx].status === 'BOOKED') return false;
        }
        return true;
    };

    const selectedSlotIndex = slots.findIndex((s) => formatTime(s.start) === selectedStartSlot);

    const estimatedPrice = useMemo(() => {
        if (selectedSlotIndex === -1) return 0;
        let total = 0;
        const fullSlots = Math.floor(slotsNeeded);
        const fraction = slotsNeeded - fullSlots;
        for (let i = 0; i < fullSlots; i++) {
            const idx = selectedSlotIndex + i;
            if (idx < slots.length) total += slots[idx].price;
        }
        if (fraction > 0 && selectedSlotIndex + fullSlots < slots.length) {
            total += slots[selectedSlotIndex + fullSlots].price * fraction;
        }
        return total;
    }, [selectedSlotIndex, slotsNeeded, slots]);

    const handleContinue = () => {
        if (!selectedStartSlot) {
            Alert.alert('Thông báo', 'Vui lòng chọn giờ bắt đầu');
            return;
        }
        router.push({
            pathname: '/(user)/home/checkout' as any,
            params: {
                fieldId,
                fieldName,
                fieldAddress,
                date: selectedDate,
                startTime: selectedStartSlot,
                duration: duration.toString(),
                estimatedPrice: estimatedPrice.toString(),
            },
        });
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 gap-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color="#089166" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                            {fieldName}
                        </Text>
                        <Text className="text-xs text-slate-400" numberOfLines={1}>
                            {fieldAddress}
                        </Text>
                    </View>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Date Picker */}
                    <View className="py-3">
                        <Text className="px-5 text-sm font-bold text-slate-900 dark:text-white mb-3">
                            Chọn ngày
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
                        >
                            {dates.map((d) => {
                                const isSelected = d.date === selectedDate;
                                return (
                                    <TouchableOpacity
                                        key={d.date}
                                        onPress={() => setSelectedDate(d.date)}
                                        className={`items-center px-4 py-3 rounded-xl border ${
                                            isSelected
                                                ? 'bg-primary border-primary'
                                                : 'bg-white dark:bg-[#1a2e26] border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <Text
                                            className={`text-xs font-medium ${
                                                isSelected ? 'text-white' : 'text-slate-400'
                                            }`}
                                        >
                                            {d.dayLabel}
                                        </Text>
                                        <Text
                                            className={`text-lg font-bold ${
                                                isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                                            }`}
                                        >
                                            {d.dayNum}
                                        </Text>
                                        <Text
                                            className={`text-[10px] ${
                                                isSelected ? 'text-white/80' : 'text-slate-400'
                                            }`}
                                        >
                                            {d.monthLabel}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Duration Selector */}
                    <View className="px-5 py-3">
                        <Text className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                            Thời lượng
                        </Text>
                        <View className="flex-row gap-3">
                            {DURATIONS.map((d) => {
                                const isSelected = d === duration;
                                return (
                                    <TouchableOpacity
                                        key={d}
                                        onPress={() => {
                                            setDuration(d);
                                            setSelectedStartSlot(null);
                                        }}
                                        className={`flex-1 py-3 rounded-xl items-center border ${
                                            isSelected
                                                ? 'bg-primary border-primary'
                                                : 'bg-white dark:bg-[#1a2e26] border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        <Text
                                            className={`text-sm font-bold ${
                                                isSelected ? 'text-white' : 'text-slate-900 dark:text-white'
                                            }`}
                                        >
                                            {d} phút
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Time Slots Grid */}
                    <View className="px-5 py-3">
                        <Text className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                            Chọn giờ bắt đầu
                        </Text>

                        {loading ? (
                            <View className="py-8 items-center">
                                <ActivityIndicator size="large" color="#089166" />
                            </View>
                        ) : slots.length === 0 ? (
                            <View className="py-8 items-center gap-2">
                                <MaterialIcons name="event-busy" size={48} color="#94a3b8" />
                                <Text className="text-slate-400 text-sm text-center px-4">
                                    {selectedDate === getTodayString()
                                        ? 'Không còn khung giờ trống cho hôm nay.\nVui lòng chọn ngày khác.'
                                        : 'Không có khung giờ nào'}
                                </Text>
                            </View>
                        ) : (
                            <View className="flex-row flex-wrap gap-2">
                                {slots.map((slot, index) => {
                                    const isBooked = slot.status === 'BOOKED';
                                    const selectable = !isBooked && canSelectSlot(index);
                                    const isSelected = formatTime(slot.start) === selectedStartSlot;
                                    const isInRange =
                                        selectedSlotIndex >= 0 &&
                                        index >= selectedSlotIndex &&
                                        index < selectedSlotIndex + Math.ceil(slotsNeeded);

                                    let bgClass = 'bg-white dark:bg-[#1a2e26] border-slate-200 dark:border-slate-700';
                                    let textClass = 'text-slate-900 dark:text-white';
                                    let priceClass = 'text-slate-500';

                                    if (isBooked) {
                                        bgClass = 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
                                        textClass = 'text-slate-300 dark:text-slate-600';
                                        priceClass = 'text-slate-300 dark:text-slate-600';
                                    } else if (isSelected || isInRange) {
                                        bgClass = 'bg-primary border-primary';
                                        textClass = 'text-white';
                                        priceClass = 'text-white/80';
                                    } else if (slot.is_peak) {
                                        bgClass = 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700';
                                        textClass = 'text-amber-800 dark:text-amber-300';
                                        priceClass = 'text-amber-600 dark:text-amber-400';
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={slot.start}
                                            disabled={isBooked || !selectable}
                                            onPress={() => setSelectedStartSlot(formatTime(slot.start))}
                                            className={`w-[31%] py-3 rounded-xl items-center border ${bgClass}`}
                                        >
                                            <Text className={`text-sm font-bold ${textClass}`}>
                                                {formatTime(slot.start)}
                                            </Text>
                                            <Text className={`text-[10px] mt-0.5 ${priceClass}`}>
                                                {isBooked ? 'Đã đặt' : formatPrice(slot.price)}
                                            </Text>
                                            {slot.is_peak && !isBooked && !isSelected && !isInRange && (
                                                <View className="absolute -top-1 -right-1 bg-amber-400 rounded-full w-4 h-4 items-center justify-center">
                                                    <MaterialIcons name="bolt" size={10} color="white" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}

                        {/* Legend */}
                        <View className="flex-row flex-wrap gap-4 mt-4">
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-3 h-3 rounded-sm bg-white border border-slate-200" />
                                <Text className="text-[10px] text-slate-400">Trống</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-300" />
                                <Text className="text-[10px] text-slate-400">Giờ cao điểm</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-200" />
                                <Text className="text-[10px] text-slate-400">Đã đặt</Text>
                            </View>
                            <View className="flex-row items-center gap-1.5">
                                <View className="w-3 h-3 rounded-sm bg-primary" />
                                <Text className="text-[10px] text-slate-400">Đã chọn</Text>
                            </View>
                        </View>
                    </View>

                    <View className="h-32" />
                </ScrollView>

                {/* Bottom Bar */}
                <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d1c17] border-t border-slate-100 dark:border-slate-800 px-5 pb-8 pt-4">
                    {selectedStartSlot && (
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-sm text-slate-500 dark:text-slate-400">
                                {selectedStartSlot} | {duration} phút | {selectedDate}
                            </Text>
                            <Text className="text-lg font-bold text-primary">
                                {formatPrice(estimatedPrice)}
                            </Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={handleContinue}
                        disabled={!selectedStartSlot}
                        className={`rounded-xl py-4 items-center ${
                            selectedStartSlot ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                    >
                        <Text className="text-white text-base font-bold">Tiếp tục</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
