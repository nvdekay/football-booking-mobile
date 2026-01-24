import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Stadium } from '../../../src/types/stadium';

interface StadiumCardProps {
  stadium: Stadium;
  onBookPress?: () => void;
}

export const StadiumCard: React.FC<StadiumCardProps> = ({
  stadium,
  onBookPress,
}) => {
  return (
    <View className="bg-white rounded-lg overflow-hidden mb-4 border border-gray-200">
      {/* Stadium Image */}
      <Image
        source={{ uri: stadium.image }}
        className="w-full h-40"
        resizeMode="cover"
      />

      {/* Stadium Info */}
      <View className="p-3">
        {/* Name */}
        <Text className="text-base font-semibold text-gray-900 mb-2">
          {stadium.name}
        </Text>

        {/* Rating */}
        <View className="flex-row items-center mb-2">
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text className="ml-1 text-sm font-medium text-gray-900">
            {stadium.rating}
          </Text>
          <Text className="ml-1 text-xs text-gray-600">
            ({stadium.reviewCount})
          </Text>
        </View>

        {/* Address */}
        <View className="flex-row items-start mb-2">
          <Ionicons name="location" size={14} color="#666666" />
          <Text className="ml-2 text-xs text-gray-600 flex-1">
            {stadium.address}
          </Text>
        </View>

        {/* Distance */}
        <View className="flex-row items-center mb-2">
          <Ionicons name="navigate" size={14} color="#666666" />
          <Text className="ml-2 text-xs text-gray-600">
            {stadium.distance} km
          </Text>
        </View>

        {/* Price Range */}
        <Text className="text-sm font-medium text-gray-900 mb-3">
          {stadium.priceMin}k - {stadium.priceMax}k/h
        </Text>

        {/* Book Button */}
        <TouchableOpacity
          onPress={onBookPress}
          className="bg-green-600 py-2 rounded items-center"
        >
          <Text className="text-white font-semibold text-sm">Đặt ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
