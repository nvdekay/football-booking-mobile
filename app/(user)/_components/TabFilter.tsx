import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { TabFilter as ITabFilter } from '../../../src/types/stadium';

interface TabFilterProps {
  tabs: ITabFilter[];
  onSelectTab?: (value: string) => void;
}

export const TabFilter: React.FC<TabFilterProps> = ({ tabs, onSelectTab }) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleSelectTab = (value: string) => {
    setActiveTab(value);
    onSelectTab?.(value);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-row gap-2"
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          onPress={() => handleSelectTab(tab.value)}
          className={`px-4 py-2 rounded-full ${
            activeTab === tab.value ? 'bg-green-600' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`font-medium ${
              activeTab === tab.value ? 'text-white' : 'text-gray-700'
            }`}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
