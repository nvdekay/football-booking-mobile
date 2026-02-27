import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { MatchLevel } from '../../../../types/matching';

const LEVELS: { value: MatchLevel | null; label: string }[] = [
    { value: null, label: 'Tất cả' },
    { value: 'VUI_VE', label: 'Vui vẻ' },
    { value: 'BAN_CHUYEN', label: 'Bán chuyên' },
    { value: 'CHUYEN_NGHIEP', label: 'Chuyên nghiệp' },
];

type Props = {
    selectedDate: string | undefined;
    selectedLevel: MatchLevel | undefined;
    onDateChange: (date: string | undefined) => void;
    onLevelChange: (level: MatchLevel | undefined) => void;
};

export function FilterBar({ selectedDate, selectedLevel, onDateChange, onLevelChange }: Props) {
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleDateChange = (_event: any, date?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (date) {
            const formatted = date.toISOString().split('T')[0];
            onDateChange(formatted);
        }
    };

    const clearDate = () => {
        onDateChange(undefined);
    };

    return (
        <View className="px-5 pb-3">
            {/* Date filter */}
            <View className="flex-row items-center gap-2 mb-3">
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="flex-row items-center gap-1.5 bg-white dark:bg-[#1a2e26] rounded-xl px-3 py-2.5 border border-slate-100 dark:border-slate-800"
                >
                    <MaterialIcons name="event" size={18} color="#089166" />
                    <Text className="text-sm text-slate-700 dark:text-slate-300">
                        {selectedDate || 'Chọn ngày'}
                    </Text>
                </TouchableOpacity>

                {selectedDate && (
                    <TouchableOpacity onPress={clearDate} className="p-1">
                        <MaterialIcons name="close" size={20} color="#94a3b8" />
                    </TouchableOpacity>
                )}
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate ? new Date(selectedDate) : new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* Level chips */}
            <View className="flex-row flex-wrap gap-2">
                {LEVELS.map((item) => {
                    const isActive = selectedLevel === item.value || (!selectedLevel && item.value === null);
                    return (
                        <TouchableOpacity
                            key={item.label}
                            onPress={() => onLevelChange(item.value ?? undefined)}
                            className={`px-3 py-2 rounded-xl border ${
                                isActive
                                    ? 'bg-primary border-primary'
                                    : 'bg-white dark:bg-[#1a2e26] border-slate-100 dark:border-slate-800'
                            }`}
                        >
                            <Text
                                className={`text-xs font-semibold ${
                                    isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'
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
