import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeaturedCarousel } from './_components/FeaturedCarousel';
import { FilterChips } from './_components/FilterChips';
import { HomeBottomNav } from './_components/HomeBottomNav';
import { HomeHeader } from './_components/HomeHeader';
import { PopularFields } from './_components/PopularFields';
import { SearchBar } from './_components/SearchBar';

export default function HomeScreen() {
    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar style="auto" />
            <SafeAreaView edges={['top']} className="flex-1">
                <HomeHeader />

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    <SearchBar />
                    <FilterChips />
                    <View className="h-4" />
                    <FeaturedCarousel />
                    <View className="h-4" />
                    <PopularFields />
                </ScrollView>

                <HomeBottomNav />
            </SafeAreaView>
        </View>
    );
}
