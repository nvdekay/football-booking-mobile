import { Stack } from 'expo-router';
import React from 'react';

export default function MatchLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="[id]" />
            <Stack.Screen name="create" />
        </Stack>
    );
}
