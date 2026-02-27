import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getFields } from '../../../api/field';
import { createMatching, getMatchingById } from '../../../api/matching';
import { useAuth } from '../../../context/AuthContext';
import { Field } from '../../../types/field';
import { CreateMatchingBody, MatchLevel } from '../../../types/matching';

const DURATIONS = [60, 90, 120];
const LEVELS: { value: MatchLevel; label: string }[] = [
    { value: 'VUI_VE', label: 'Vui vẻ' },
    { value: 'BAN_CHUYEN', label: 'Bán chuyên' },
    { value: 'CHUYEN_NGHIEP', label: 'Chuyên nghiệp' },
];

export default function CreateMatchScreen() {
    const router = useRouter();
    const { token } = useAuth();
    const { editId } = useLocalSearchParams<{ editId?: string }>();

    // Form state
    const [matchDate, setMatchDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState<Date>(() => {
        const d = new Date();
        d.setHours(18, 0, 0, 0);
        return d;
    });
    const [duration, setDuration] = useState(90);
    const [level, setLevel] = useState<MatchLevel>('VUI_VE');
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [description, setDescription] = useState('');

    // UI state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showFieldPicker, setShowFieldPicker] = useState(false);
    const [fields, setFields] = useState<Field[]>([]);
    const [loadingFields, setLoadingFields] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);

    // Load fields for picker
    useEffect(() => {
        (async () => {
            try {
                setLoadingFields(true);
                const response = await getFields();
                setFields(response.data);
            } catch (err) {
                console.error('Failed to load fields:', err);
            } finally {
                setLoadingFields(false);
            }
        })();
    }, []);

    // Load existing matching data for edit mode
    useEffect(() => {
        if (!editId || !token) return;
        (async () => {
            try {
                setLoadingEdit(true);
                const response = await getMatchingById(parseInt(editId), token);
                const m = response.data;
                setMatchDate(new Date(m.match_date));
                const [h, min] = m.start_time.split(':');
                const t = new Date();
                t.setHours(parseInt(h), parseInt(min), 0, 0);
                setStartTime(t);
                setDuration(m.duration_minutes);
                setLevel(m.level);
                setDescription(m.description || '');
            } catch (err: any) {
                Alert.alert('Lỗi', 'Không thể tải thông tin kèo');
            } finally {
                setLoadingEdit(false);
            }
        })();
    }, [editId, token]);

    const handleDateChange = (_event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) setMatchDate(date);
    };

    const handleTimeChange = (_event: any, date?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (date) setStartTime(date);
    };

    const formatDateDisplay = (d: Date) =>
        d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });

    const formatTimeDisplay = (d: Date) =>
        `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;

    const handleSubmit = async () => {
        if (!token) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDay = new Date(matchDate);
        selectedDay.setHours(0, 0, 0, 0);

        if (selectedDay < today) {
            Alert.alert('Lỗi', 'Ngày thi đấu phải từ hôm nay trở đi');
            return;
        }

        try {
            setSubmitting(true);
            const body: CreateMatchingBody = {
                match_date: matchDate.toISOString().split('T')[0],
                start_time: formatTimeDisplay(startTime),
                duration_minutes: duration,
                level,
                description: description.trim() || undefined,
                field_id: selectedField?.field_id,
            };

            if (editId) {
                // Use PATCH for edit
                const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
                const response = await fetch(`${BASE_URL}/team-matchings/${editId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data?.message || 'Cập nhật thất bại');
                }
                Alert.alert('Thành công', 'Đã cập nhật kèo đấu!');
            } else {
                await createMatching(body, token);
                Alert.alert('Thành công', 'Đã tạo kèo đấu mới!');
            }
            router.back();
        } catch (err: any) {
            Alert.alert('Lỗi', err.message || 'Không thể tạo kèo');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingEdit) {
        return (
            <View className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
                <ActivityIndicator size="large" color="#089166" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1">
                {/* Header */}
                <View className="flex-row items-center px-4 py-3 gap-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color="#089166" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900 dark:text-white">
                        {editId ? 'Chỉnh sửa kèo' : 'Tạo kèo mới'}
                    </Text>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    {/* Date picker */}
                    <View className="mx-5 mb-4">
                        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Ngày thi đấu *
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className="bg-white dark:bg-[#1a2e26] rounded-xl px-4 py-3.5 border border-slate-100 dark:border-slate-800 flex-row items-center gap-2"
                        >
                            <MaterialIcons name="event" size={20} color="#089166" />
                            <Text className="text-sm text-slate-800 dark:text-white">
                                {formatDateDisplay(matchDate)}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={matchDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                onChange={handleDateChange}
                                minimumDate={new Date()}
                            />
                        )}
                    </View>

                    {/* Time picker */}
                    <View className="mx-5 mb-4">
                        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Giờ bắt đầu *
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowTimePicker(true)}
                            className="bg-white dark:bg-[#1a2e26] rounded-xl px-4 py-3.5 border border-slate-100 dark:border-slate-800 flex-row items-center gap-2"
                        >
                            <MaterialIcons name="access-time" size={20} color="#089166" />
                            <Text className="text-sm text-slate-800 dark:text-white">
                                {formatTimeDisplay(startTime)}
                            </Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleTimeChange}
                                is24Hour={true}
                            />
                        )}
                    </View>

                    {/* Duration selector */}
                    <View className="mx-5 mb-4">
                        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Thời lượng
                        </Text>
                        <View className="flex-row gap-3">
                            {DURATIONS.map((d) => (
                                <TouchableOpacity
                                    key={d}
                                    onPress={() => setDuration(d)}
                                    className={`flex-1 rounded-xl py-3 items-center border ${
                                        duration === d
                                            ? 'bg-primary border-primary'
                                            : 'bg-white dark:bg-[#1a2e26] border-slate-100 dark:border-slate-800'
                                    }`}
                                >
                                    <Text
                                        className={`text-sm font-semibold ${
                                            duration === d
                                                ? 'text-white'
                                                : 'text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {d} phút
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Level selector */}
                    <View className="mx-5 mb-4">
                        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Trình độ *
                        </Text>
                        <View className="flex-row gap-3">
                            {LEVELS.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() => setLevel(item.value)}
                                    className={`flex-1 rounded-xl py-3 items-center border ${
                                        level === item.value
                                            ? 'bg-primary border-primary'
                                            : 'bg-white dark:bg-[#1a2e26] border-slate-100 dark:border-slate-800'
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-semibold ${
                                            level === item.value
                                                ? 'text-white'
                                                : 'text-slate-700 dark:text-slate-300'
                                        }`}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Field selector */}
                    <View className="mx-5 mb-4">
                        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Sân bóng (không bắt buộc)
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowFieldPicker(!showFieldPicker)}
                            className="bg-white dark:bg-[#1a2e26] rounded-xl px-4 py-3.5 border border-slate-100 dark:border-slate-800 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="location-on" size={20} color="#089166" />
                                <Text className="text-sm text-slate-800 dark:text-white">
                                    {selectedField?.name || 'Chọn sân (tùy chọn)'}
                                </Text>
                            </View>
                            <MaterialIcons
                                name={showFieldPicker ? 'expand-less' : 'expand-more'}
                                size={24}
                                color="#94a3b8"
                            />
                        </TouchableOpacity>

                        {showFieldPicker && (
                            <View className="mt-2 bg-white dark:bg-[#1a2e26] rounded-xl border border-slate-100 dark:border-slate-800 max-h-48">
                                {loadingFields ? (
                                    <View className="py-4 items-center">
                                        <ActivityIndicator size="small" color="#089166" />
                                    </View>
                                ) : (
                                    <ScrollView nestedScrollEnabled>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedField(null);
                                                setShowFieldPicker(false);
                                            }}
                                            className="px-4 py-3 border-b border-slate-50 dark:border-slate-800"
                                        >
                                            <Text className="text-sm text-slate-400">
                                                Không chọn sân
                                            </Text>
                                        </TouchableOpacity>
                                        {fields.map((field) => (
                                            <TouchableOpacity
                                                key={field.field_id}
                                                onPress={() => {
                                                    setSelectedField(field);
                                                    setShowFieldPicker(false);
                                                }}
                                                className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800 ${
                                                    selectedField?.field_id === field.field_id
                                                        ? 'bg-primary/5'
                                                        : ''
                                                }`}
                                            >
                                                <Text className="text-sm font-medium text-slate-800 dark:text-white">
                                                    {field.name}
                                                </Text>
                                                <Text className="text-xs text-slate-400" numberOfLines={1}>
                                                    {field.address}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Description */}
                    <View className="mx-5 mb-4">
                        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Mô tả thêm
                        </Text>
                        <TextInput
                            placeholder="Ví dụ: Đội 5 người, tìm đối chơi vui..."
                            placeholderTextColor="#94a3b8"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            className="bg-white dark:bg-[#1a2e26] rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white border border-slate-100 dark:border-slate-800 min-h-[80px]"
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="h-32" />
                </ScrollView>

                {/* Submit Button */}
                <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#0d1c17] border-t border-slate-100 dark:border-slate-800 px-5 pb-8 pt-4">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting}
                        className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${
                            submitting ? 'bg-slate-300 dark:bg-slate-700' : 'bg-primary'
                        }`}
                    >
                        {submitting && <ActivityIndicator size="small" color="white" />}
                        <Text className="text-white text-base font-bold">
                            {submitting
                                ? 'Đang xử lý...'
                                : editId
                                ? 'Cập nhật kèo'
                                : 'Tạo kèo'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}
