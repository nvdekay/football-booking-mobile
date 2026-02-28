import { Stack } from 'expo-router';
import React from 'react';

export default function ManageLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="users" />
            <Stack.Screen name="services" />
            <Stack.Screen name="bookings" />
            <Stack.Screen name="matchings" />
        </Stack>
    );
}
