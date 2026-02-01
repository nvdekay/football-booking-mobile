import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export const FeaturedCarousel = () => {
    return (
        <View className="flex-col gap-3">
            <View className="px-4 flex-row justify-between items-end">
                <Text className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Featured Fields</Text>
                <TouchableOpacity>
                    <Text className="text-primary text-sm font-medium">See all</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 8 }}
            >
                {/* Card 1 */}
                <TouchableOpacity className="w-72 h-44 rounded-2xl overflow-hidden relative shadow-lg bg-gray-200">
                    <ImageBackground
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCm9YZI9lePxA_pCb-7vANK4BiiM-tApYNvd4KEw9E_y2SazKgHAPC0lvEOiYd-VgdAmyRtPiZxA2k8r-Dmea3FOpPxQlTecwMenwTgYeEBjA4I3KqNaAH4AIVVeN3GN8_KtuvLLUJG2P-nOMvsB1wabt6kUTEdzUfU1a7LZVLUj29YLuuYYPHotK36Wg8Xce2g6McOyd2DUxBpB8WEdrWXXg9WDeCUdHt1vu1GfCes83mgeuLaxcpwBTeabGF9YcCfSj2dtfDT4Jw" }}
                        className="flex-1"
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                            locations={[0, 0.4, 1]}
                            className="absolute inset-0"
                        />

                        <View className="absolute top-3 right-3 bg-white/20 px-2 py-1 rounded-lg border border-white/30">
                            <Text className="text-xs font-bold text-white">20% OFF</Text>
                        </View>

                        <View className="absolute bottom-0 left-0 p-4 w-full">
                            <Text className="text-white text-lg font-bold leading-tight mb-1">Central Indoor Arena</Text>
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="bolt" size={16} color="#e5e7eb" />
                                <Text className="text-gray-200 text-sm">Instant Confirmation</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>

                {/* Card 2 */}
                <TouchableOpacity className="w-72 h-44 rounded-2xl overflow-hidden relative shadow-lg bg-gray-200">
                    <ImageBackground
                        source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuClftJJOkVzktSQf6VKLgzPoulbots1QAdFjsNYLPtsrq9DNgMOrmykR56MxixSNxiri-U_ak3mcmKCuu02lWcIvBLoD-STFLIA-heS7T4RFSH2TLBPkn3TfP-CScudGfwQ64XIpqCJOFcDEgqNN6tbU7g8tXSGSAvPB6eC-sjWC0IvxEauKvuvE8jK8_Rt7Ean-GqYoqWLyxYITkxXr1NcQB7kfkGJg_43yx34T-uLMtHQsbpsYNSQLyEXrSnR5fDNyaDZqwUFmlI" }}
                        className="flex-1"
                        resizeMode="cover"
                    >
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                            locations={[0, 0.4, 1]}
                            className="absolute inset-0"
                        />

                        <View className="absolute top-3 right-3 bg-primary px-2 py-1 rounded-lg shadow-sm">
                            <Text className="text-xs font-bold text-white">NEW</Text>
                        </View>

                        <View className="absolute bottom-0 left-0 p-4 w-full">
                            <Text className="text-white text-lg font-bold leading-tight mb-1">Riverside Turf</Text>
                            <View className="flex-row items-center gap-1">
                                <MaterialIcons name="star" size={16} color="#e5e7eb" />
                                <Text className="text-gray-200 text-sm">4.9 (120 reviews)</Text>
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};
