import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import useProtectedRoute from '../src/hooks/useProtectedRoute';
import '../src/styles/global.css';

function LayoutContent() {
  useProtectedRoute();
  return <Slot />;
}

export default function Layout() {
  return (
    <AuthProvider>
      <LayoutContent />
    </AuthProvider>
  )
}
