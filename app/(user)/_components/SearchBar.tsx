import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { TextInput, View } from 'react-native';

interface SearchBarProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Tìm sân, địa chỉ...',
  onChangeText,
}) => {
  const [text, setText] = useState('');

  const handleChangeText = (value: string) => {
    setText(value);
    onChangeText?.(value);
  };

  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
      <Ionicons name="search" size={20} color="#999999" />
      <TextInput
        className="flex-1 ml-2 text-base text-gray-900"
        placeholder={placeholder}
        placeholderTextColor="#999999"
        value={text}
        onChangeText={handleChangeText}
      />
    </View>
  );
};
