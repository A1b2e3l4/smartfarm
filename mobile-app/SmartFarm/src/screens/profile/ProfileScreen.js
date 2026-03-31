/**
 * SmartFarm - Profile Screen
 * 
 * Displays user profile information and provides options to edit profile,
 * change settings, and logout.
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';
import { COLORS } from '../../App';
import { useAuth } from '../../context/AuthContext';

// Components
import Button from '../../components/Button';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, isFarmer, isBuyer } = useAuth();
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            setLogoutLoading(true);
            const result = await logout();
            setLogoutLoading(false);
            if (!result.success) {
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: '✏️',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: '🌾',
      title: isFarmer() ? 'My Crops' : 'Browse Crops',
      subtitle: isFarmer() ? 'Manage your crop listings' : 'Find fresh produce',
      onPress: () => navigation.navigate('Crops'),
    },
    {
      icon: '📦',
      title: 'My Orders',
      subtitle: 'View your order history',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: '❓',
      title: 'Help & Support',
      subtitle: 'Get help with using SmartFarm',
      onPress: () => Alert.alert('Coming Soon', 'Help center will be available soon!'),
    },
    {
      icon: '📄',
      title: 'Terms & Privacy',
      subtitle: 'Read our terms and privacy policy',
      onPress: () => Alert.alert('Coming Soon', 'Terms and privacy policy will be available soon!'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user?.profile_image ? (
            <Image 
              source={{ uri: user.profile_image }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <TouchableOpacity 
            style={styles.editImageButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editImageIcon}>📷</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {isFarmer() ? '🌾 Farmer' : '🛒 Buyer'}
          </Text>
        </View>

        {user?.phone && (
          <Text style={styles.phone}>📞 {user.phone}</Text>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          loading={logoutLoading}
          variant="danger"
          size="large"
        />
      </View>

      {/* App Version */}
      <Text style={styles.version}>SmartFarm v1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editImageIcon: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: COLORS.white + '30',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  roleText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  phone: {
    fontSize: 14,
    color: COLORS.white + 'CC',
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  menuArrow: {
    fontSize: 24,
    color: COLORS.gray,
  },
  logoutContainer: {
    padding: 16,
    paddingTop: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 24,
  },
});

export default ProfileScreen;
