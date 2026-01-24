import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';

export default function useProtectedRoute() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    const inAuthGroup = segments[0] === '(auth)';
    const inUserGroup = segments[0] === '(user)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!user && !inAuthGroup) {
      // User is not signed in and not in auth group, redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is signed in but still in auth group, redirect based on role
      if (user.role === 'ADMIN') {
        router.replace('/(admin)');
      } else {
        router.replace('/(user)');
      }
    } else if (user && inUserGroup && user.role === 'ADMIN') {
      // Admin trying to access user area, redirect to admin
      router.replace('/(admin)');
    } else if (user && inAdminGroup && user.role === 'USER') {
      // User trying to access admin area, redirect to user
      router.replace('/(user)');
    }
  }, [user, segments, loading]);
}