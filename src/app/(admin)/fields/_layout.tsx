import { Stack } from 'expo-router';
import React from 'react';

export default function FieldsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="create" />
            <Stack.Screen name="[id]/pricing" />
            <Stack.Screen name="[id]/edit" />
        </Stack>
    );
}
