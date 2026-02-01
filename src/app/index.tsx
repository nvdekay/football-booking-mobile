import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Always redirect to login when app starts
  return <Redirect href="/(auth)/login" />;
}