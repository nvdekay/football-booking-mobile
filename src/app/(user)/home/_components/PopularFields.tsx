import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, ImageBackground, Text, TouchableOpacity, View } from 'react-native';

export const PopularFields = () => {
    return (
        <View className="flex-col px-4 gap-4 mt-4 pb-8">
            <Text className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] text-left">
                Popular Fields Near You
            </Text>

            {/* Card 1 */}
            <TouchableOpacity className="flex-col w-full bg-white dark:bg-[#1a2e26] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                <ImageBackground
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCO_fwLmq4nrIHhVu-RN5TXNF3j4wi6LvOUOWKHeq9wKA3MKxvunIOwv7aQUXhzyOHKy64u7oO77wqUeEhcqAY1cpaIYvUrEC8rUefdMmWL4bIPVh0-dbeuBCtktinniEGhJP_hlGhcKE7W0cQdFhFDpQQW4uAP6BJvrZoavAcwgBYT5s7ziUkUrBg-8QQihYr_dkcCkkI2INXGUiHnHm84fUSsR4c-nLBPapmQqg2S1MvtTAzx1QqWAtqmwyfWYVfzKOjrK3QiA04" }}
                    className="h-40 w-full"
                    resizeMode="cover"
                >
                    <View className="absolute top-3 left-3 flex-row gap-2">
                        <View className="bg-white/95 dark:bg-black/80 px-2.5 py-1 rounded-md">
                            <Text className="text-xs font-bold text-primary tracking-wide uppercase">7-a-side</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="absolute top-3 right-3 bg-white/20 rounded-full p-1.5 backdrop-blur-md">
                        <MaterialIcons name="favorite" size={20} color="white" />
                    </TouchableOpacity>
                </ImageBackground>

                <View className="p-4 flex-col gap-3">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white">Emerald City Arena</Text>
                            <View className="flex-row items-center gap-1.5 mt-1">
                                <MaterialIcons name="location-on" size={18} color="#089166" />
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">1.2 km away</Text>
                                <Text className="text-slate-300">•</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">Synthetic Turf</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-primary font-bold text-lg leading-tight">$50</Text>
                            <Text className="text-xs text-slate-400 font-normal">per hour</Text>
                        </View>
                    </View>

                    <View className="h-px w-full bg-slate-100 dark:bg-slate-700/50" />

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="flex-row -space-x-2">
                                <Image
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdpbXUiAg3Px9CnLFGCh-ZWCkbS8zO0TUqfJUupFjlG4UU5WPT4d3x1ebFq8IIgKvqyOw-x0Lxp8VvGILe5KtDOT8Mh7NsJLv-oqSIROcLKWb7CUnc4bihjzwOyOZEjVG4Xi9ggxh1hZlHP2drSCiNKZW6Zc30oRvYiSbnDbZldnpqPIfuV-SHqhW1K1KM_z3zWQwbsw8_NmgKO8ekOcpSwmKFlrG_aly5pqPO6pcMREk0WVg7PeI41VAR3EzgpmNeoe1QBDpeA3E' }}
                                    className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1a2e26] bg-gray-300"
                                />
                                <Image
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIr5G5bBArgGH6vKgqex-OpDYWC54bIgIXMDiQ117q1WUSa0heaNKjSYbONftpvFK3vbtUK_fuxcnm9WcdLDjGFhDdyvKv-jgl8bTL-AeVVV7zB4jJP_lgUEreS5eNlfT5nVWzGe950vR9JVjb8p-kJ4_00ZUk5kIODvB2sdxIQFp0Vp4UJCRsQgUSyZNHs_F_d6rERc8R-6FNwHflCQGttOscC_IVj8EK7mrtG2oS1qRyWWRsWcqfsly4KkoeYts3NZj-8667IAA' }}
                                    className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1a2e26] bg-gray-300"
                                />
                                <View className="w-7 h-7 rounded-full border-2 border-white dark:border-[#1a2e26] bg-gray-100 dark:bg-slate-700 items-center justify-center">
                                    <Text className="text-[10px] font-bold text-slate-500">+12</Text>
                                </View>
                            </View>
                            <Text className="ml-3 text-xs text-slate-500">friends played here</Text>
                        </View>
                        <TouchableOpacity className="bg-primary/5 px-3 py-1.5 rounded-lg">
                            <Text className="text-primary text-sm font-semibold">Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Card 2 */}
            <TouchableOpacity className="flex-col w-full bg-white dark:bg-[#1a2e26] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                <ImageBackground
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8mcUomeI72v3AAayV7ApSYMZHxzEz7A7eoE2DDmrbaIqPA_O1r2Gcfq69a43WeeMDjDBQFFCG44cIE4wDh6FiFf0-h-UlzRL5ToD26yAiQX4dpiDjuUbQ_CRKHfQckEGn7yvxzEP7YeswgLBJCJagpr1ZvdjpR441pFhjTWcxKk_LI3EiItp-S1p-PG_cuwFYasrAH763KfUXviGu6sLF09tPIJ2FLb52sm8--puuxcLQmYtbhdadWTXsN5V4mC1-OvXkAhOYO9k" }}
                    className="h-40 w-full"
                    resizeMode="cover"
                >
                    <View className="absolute top-3 left-3 flex-row gap-2">
                        <View className="bg-white/95 dark:bg-black/80 px-2.5 py-1 rounded-md">
                            <Text className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase">5-a-side</Text>
                        </View>
                        <View className="bg-white/95 dark:bg-black/80 px-2.5 py-1 rounded-md">
                            <Text className="text-xs font-bold text-orange-600 dark:text-orange-400 tracking-wide uppercase">Indoor</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="absolute top-3 right-3 bg-white/20 rounded-full p-1.5 backdrop-blur-md">
                        <MaterialIcons name="favorite-border" size={20} color="white" />
                    </TouchableOpacity>
                </ImageBackground>

                <View className="p-4 flex-col gap-3">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white">Downtown Kicks</Text>
                            <View className="flex-row items-center gap-1.5 mt-1">
                                <MaterialIcons name="location-on" size={18} color="#089166" />
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">3.5 km away</Text>
                                <Text className="text-slate-300">•</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">Hard Court</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-primary font-bold text-lg leading-tight">$40</Text>
                            <Text className="text-xs text-slate-400 font-normal">per hour</Text>
                        </View>
                    </View>

                    <View className="h-px w-full bg-slate-100 dark:bg-slate-700/50" />

                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-1">
                            <MaterialIcons name="star" size={16} color="#f59e0b" />
                            <Text className="text-xs font-medium text-amber-500">4.5 (86)</Text>
                        </View>
                        <TouchableOpacity className="bg-primary/5 px-3 py-1.5 rounded-lg">
                            <Text className="text-primary text-sm font-semibold">Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Card 3 */}
            <TouchableOpacity className="flex-col w-full bg-white dark:bg-[#1a2e26] rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                <ImageBackground
                    source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7KI62nQB6TyPdLLxVE6wMTLtK9XvkhTdAjAlyOcv0QJQIJAuCMAdjlV3aO_S9lCzL4NPV-J8W2myFJfvPhd3PZzbABpQSZ8cVo7_jaVgmpPYFR9UFXz63hrHDPLxVSog4yE6nm_PUFZxOc2qbBaXdKKX94Q0bltoEz9LRawp37RlZU4RUj6OFG1fho0l3xhbZJ7Y4Jkl0kkx7phgUQBXAzW4r2kLIq-2_s-zS6El2J3hAAbLQ5NZBNeycuiAJBo5RZaqE3TfYAAQ" }}
                    className="h-40 w-full"
                    resizeMode="cover"
                >
                    <View className="absolute top-3 left-3 flex-row gap-2">
                        <View className="bg-white/95 dark:bg-black/80 px-2.5 py-1 rounded-md">
                            <Text className="text-xs font-bold text-primary tracking-wide uppercase">11-a-side</Text>
                        </View>
                    </View>
                    <TouchableOpacity className="absolute top-3 right-3 bg-white/20 rounded-full p-1.5 backdrop-blur-md">
                        <MaterialIcons name="favorite-border" size={20} color="white" />
                    </TouchableOpacity>
                </ImageBackground>

                <View className="p-4 flex-col gap-3">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white">North District Stadium</Text>
                            <View className="flex-row items-center gap-1.5 mt-1">
                                <MaterialIcons name="location-on" size={18} color="#089166" />
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">5.0 km away</Text>
                                <Text className="text-slate-300">•</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-sm">Natural Grass</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-primary font-bold text-lg leading-tight">$85</Text>
                            <Text className="text-xs text-slate-400 font-normal">per hour</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};
