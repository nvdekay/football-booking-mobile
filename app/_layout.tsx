import { Slot } from 'expo-router';
import React from 'react';
import { AuthProvider } from '../src/context/AuthContext';
import '../src/styles/global.css';

export default function Layout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  )
}
