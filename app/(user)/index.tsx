import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { MOCK_STADIUMS, TAB_FILTERS } from '../../src/constants/mockStadiums';
import { FeaturedStadium } from './_components/FeaturedStadium';
import { Header } from './_components/Header';
import { SearchBar } from './_components/SearchBar';
import { StadiumCard } from './_components/StadiumCard';
import { TabFilter } from './_components/TabFilter';

export default function UserHome() {
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');

  // Filter stadiums based on selected tab and search text
  const filteredStadiums = useMemo(() => {
    let filtered = MOCK_STADIUMS;

    // Filter by tab
    if (selectedTab !== 'all' && selectedTab !== 'g') {
      filtered = filtered.filter((stadium) => stadium.type === selectedTab);
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (stadium) =>
          stadium.name.toLowerCase().includes(searchLower) ||
          stadium.address.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [selectedTab, searchText]);

  const handleTabSelect = (value: string) => {
    setSelectedTab(value);
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
      >
        {/* Header with greeting */}
        <Header />

        {/* Search Bar */}
        <View className="mb-4">
          <SearchBar onChangeText={handleSearch} />
        </View>

        {/* Tab Filter */}
        <View className="mb-4">
          <TabFilter tabs={TAB_FILTERS} onSelectTab={handleTabSelect} />
        </View>

        {/* Featured Stadiums */}
        <FeaturedStadium stadiums={MOCK_STADIUMS} />

        {/* Danh sách sân heading */}
        <View className="mb-4">
          {/* This will be displayed by the text in the list of stadiums */}
        </View>

        {/* Stadium List */}
        <View>
          {filteredStadiums.map((stadium) => (
            <StadiumCard key={stadium.id} stadium={stadium} onBookPress={() => {}} />
          ))}
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
