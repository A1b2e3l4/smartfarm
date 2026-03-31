/**
 * SmartFarm - App Navigator
 * 
 * Main app navigation with bottom tabs:
 * - Home/Dashboard
 * - Crops/Marketplace
 * - Orders
 * - Profile
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../App';

// Context
import { useAuth } from '../context/AuthContext';

// Screens - Dashboard
import DashboardScreen from '../screens/dashboard/DashboardScreen';

// Screens - Crops
import CropListScreen from '../screens/crops/CropListScreen';
import CropDetailScreen from '../screens/crops/CropDetailScreen';
import AddCropScreen from '../screens/crops/AddCropScreen';

// Screens - Orders
import OrderListScreen from '../screens/orders/OrderListScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';

// Screens - Profile
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Tab Icon Component
const TabIcon = ({ name, focused }) => {
  // Simple text-based icons (replace with actual icon library like react-native-vector-icons)
  const icons = {
    Home: '🏠',
    Crops: '🌾',
    Orders: '📦',
    Profile: '👤',
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
      <Text style={styles.icon}>{icons[name] || '📱'}</Text>
    </View>
  );
};

// Dashboard Stack Navigator
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
    }}
  >
    <Stack.Screen 
      name="DashboardMain" 
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
  </Stack.Navigator>
);

// Crops Stack Navigator
const CropsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
    }}
  >
    <Stack.Screen 
      name="CropList" 
      component={CropListScreen}
      options={{ title: 'Browse Crops' }}
    />
    <Stack.Screen 
      name="CropDetail" 
      component={CropDetailScreen}
      options={{ title: 'Crop Details' }}
    />
    <Stack.Screen 
      name="AddCrop" 
      component={AddCropScreen}
      options={{ title: 'Add New Crop' }}
    />
  </Stack.Navigator>
);

// Orders Stack Navigator
const OrdersStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
    }}
  >
    <Stack.Screen 
      name="OrderList" 
      component={OrderListScreen}
      options={{ title: 'My Orders' }}
    />
    <Stack.Screen 
      name="OrderDetail" 
      component={OrderDetailScreen}
      options={{ title: 'Order Details' }}
    />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: COLORS.primary },
      headerTintColor: COLORS.white,
    }}
  >
    <Stack.Screen 
      name="ProfileMain" 
      component={ProfileScreen}
      options={{ title: 'My Profile' }}
    />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
  </Stack.Navigator>
);

// Main App Navigator with Bottom Tabs
const AppNavigator = () => {
  const { isFarmer } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Crops" 
        component={CropsStack}
        options={{ tabBarLabel: isFarmer() ? 'My Crops' : 'Market' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersStack}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingBottom: 8,
    paddingTop: 8,
    height: 70,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  iconContainerFocused: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
    borderRadius: 8,
  },
  icon: {
    fontSize: 24,
  },
});

export default AppNavigator;
