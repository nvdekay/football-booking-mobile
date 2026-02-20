import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[id]" />
            <Stack.Screen name="availability" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="payment" />
        </Stack>
    );
}
