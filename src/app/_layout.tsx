import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import useProtectedRoute from '../hooks/useProtectedRoute';
import '../styles/global.css';

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
