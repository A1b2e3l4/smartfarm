/**
 * SmartFarm - Root Navigator
 * 
 * Main navigation component that handles authentication flow.
 * Shows AuthNavigator when not logged in, AppNavigator when authenticated.
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Context
import { useAuth } from '../context/AuthContext';

// Navigators
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

// Components
import Loading from '../components/Loading';

const Stack = createStackNavigator();

const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading screen while checking auth status
  if (loading) {
    return <Loading fullScreen text="Starting SmartFarm..." />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
