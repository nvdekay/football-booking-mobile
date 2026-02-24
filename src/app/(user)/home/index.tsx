import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getFields } from '../../../api/field';
import { Field, FieldSearchParams, FieldType } from '../../../types/field';
import { FeaturedCarousel } from './_components/FeaturedCarousel';
import { FieldFilterPanel } from './_components/FieldFilterPanel';
import { FilterChips } from './_components/FilterChips';
import { HomeHeader } from './_components/HomeHeader';
import { PopularFields } from './_components/PopularFields';
import { SearchBar } from './_components/SearchBar';

export default function HomeScreen() {
    const router = useRouter();
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number; long: number } | null>(null);

    const [keyword, setKeyword] = useState('');
    const [selectedType, setSelectedType] = useState<FieldType | null>(null);

    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [appliedFilters, setAppliedFilters] = useState<
        Pick<FieldSearchParams, 'min_price' | 'max_price' | 'rating'>
    >({});

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setUserLocation({ lat: loc.coords.latitude, long: loc.coords.longitude });
            }
        })();
    }, []);

    useEffect(() => {
        const params: FieldSearchParams = { ...appliedFilters };
        if (keyword.trim()) params.keyword = keyword.trim();
        if (selectedType) params.type = selectedType;
        if (userLocation) {
            params.lat = userLocation.lat;
            params.long = userLocation.long;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await getFields(params);
                setFields(response.data);
            } catch (err) {
                console.error('Failed to fetch fields:', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [keyword, selectedType, appliedFilters, userLocation]);

    const handleApplyFilters = () => {
        const filters: typeof appliedFilters = {};
        const min = parseInt(minPrice);
        const max = parseInt(maxPrice);
        if (!isNaN(min)) filters.min_price = min;
        if (!isNaN(max)) filters.max_price = max;
        if (rating) filters.rating = rating;
        setAppliedFilters(filters);
        setShowFilterPanel(false);
    };

    const handleResetFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setRating(null);
        setAppliedFilters({});
        setShowFilterPanel(false);
    };

    const handleFieldPress = (field: Field) => {
        router.push(`/(user)/home/${field.field_id}` as any);
    };

    const isFilterActive =
        showFilterPanel || Object.keys(appliedFilters).length > 0;

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1">
                <HomeHeader onWalletPress={() => router.navigate('/(user)/profile/wallet' as any)} />

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <SearchBar
                        value={keyword}
                        onChangeText={setKeyword}
                        onFilterPress={() => setShowFilterPanel(!showFilterPanel)}
                        isFilterActive={isFilterActive}
                    />

                    {showFilterPanel && (
                        <FieldFilterPanel
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            rating={rating}
                            onMinPriceChange={setMinPrice}
                            onMaxPriceChange={setMaxPrice}
                            onRatingChange={setRating}
                            onApply={handleApplyFilters}
                            onReset={handleResetFilters}
                        />
                    )}

                    <FilterChips
                        selectedType={selectedType}
                        onTypeChange={setSelectedType}
                    />

                    <View className="h-4" />
                    <FeaturedCarousel fields={fields} onFieldPress={handleFieldPress} />
                    <View className="h-4" />
                    <PopularFields fields={fields} loading={loading} onFieldPress={handleFieldPress} />
                </ScrollView>

            </SafeAreaView>
        </View>
    );
}
