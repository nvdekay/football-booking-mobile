import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stadium } from '../../../src/types/stadium';

interface FeaturedStadiumProps {
  stadiums: Stadium[];
  onViewMore?: () => void;
}

export const FeaturedStadium: React.FC<FeaturedStadiumProps> = ({
  stadiums,
  onViewMore,
}) => {
  const featured = stadiums.filter((s) => s.isFeatured);

  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-semibold text-gray-900">
          Gợi ý cho bạn
        </Text>
        <TouchableOpacity onPress={onViewMore}>
          <Text className="text-green-600 text-sm font-medium">Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scroll for Featured Stadiums */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        scrollEventThrottle={16}
      >
        {featured.map((stadium, index) => (
          <View
            key={stadium.id}
            className={`rounded-lg overflow-hidden mr-3 ${
              index === featured.length - 1 ? 'mr-0' : ''
            }`}
            style={{ width: 160 }}
          >
            <Image
              source={{ uri: stadium.image }}
              className="w-full h-32"
              resizeMode="cover"
            />
            {/* Info Overlay */}
            <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 px-2 py-1.5">
              <Text className="text-white text-xs font-semibold mb-1 line-clamp-1">
                {stadium.name}
              </Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="star" size={12} color="#FFC107" />
                  <Text className="text-white text-xs ml-1">
                    {stadium.rating}
                  </Text>
                </View>
                <Text className="text-white text-xs">
                  {stadium.distance} km
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
