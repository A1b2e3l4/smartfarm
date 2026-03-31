/**
 * SmartFarm App - Main Application Component
 * 
 * Sets up:
 * - Authentication context
 * - Navigation container
 * - Root navigator with auth flow
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Navigation
import RootNavigator from './navigation/RootNavigator';

// Theme colors
export const COLORS = {
  primary: '#2E7D32',      // Dark green
  primaryLight: '#4CAF50', // Light green
  primaryDark: '#1B5E20',  // Darker green
  accent: '#8BC34A',       // Light green accent
  background: '#F5F5F5',   // Light gray background
  white: '#FFFFFF',
  black: '#000000',
  gray: '#757575',
  lightGray: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={COLORS.primary} />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
