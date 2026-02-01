import { Redirect } from 'expo-router';
import React from 'react';

export default function UserIndex() {
    return <Redirect href="/(user)/home" />;
}
