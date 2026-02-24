import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AuthLayout() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (user) {
            if (user.role === 'ADMIN') {
                router.replace('/(admin)/dashboard' as any);
            } else {
                router.replace('/(user)/home' as any);
            }
        }
    }, [user, loading]);

    return <Stack screenOptions={{ headerShown: false }} />;
}
