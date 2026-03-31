/**
 * SmartFarm - Dashboard Screen
 * 
 * Shows summary statistics and recent activity for the user.
 * Different content for farmers and buyers.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../../App';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';

// Components
import Card from '../../components/Card';
import Loading from '../../components/Loading';

const DashboardScreen = ({ navigation }) => {
  const { user, isFarmer } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]}! 👋</Text>
          <Text style={styles.role}>
            {isFarmer() ? 'Farmer Account' : 'Buyer Account'}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        {isFarmer() ? (
          <>
            {renderStatCard('My Crops', stats?.total_crops || 0, '🌾', COLORS.primary)}
            {renderStatCard('Orders', stats?.total_orders || 0, '📦', COLORS.warning)}
            {renderStatCard('Earnings', `$${parseFloat(stats?.total_earnings || 0).toFixed(2)}`, '💰', COLORS.success)}
            {renderStatCard('Available', stats?.available_crops || 0, '✅', COLORS.accent)}
          </>
        ) : (
          <>
            {renderStatCard('My Orders', stats?.total_orders || 0, '📦', COLORS.primary)}
            {renderStatCard('Pending', stats?.pending_orders || 0, '⏳', COLORS.warning)}
            {renderStatCard('Delivered', stats?.delivered_orders || 0, '✅', COLORS.success)}
            {renderStatCard('Total Spent', `$${parseFloat(stats?.total_spent || 0).toFixed(2)}`, '💰', COLORS.accent)}
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          {isFarmer() ? (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Crops', { screen: 'AddCrop' })}
              >
                <Text style={styles.actionIcon}>➕</Text>
                <Text style={styles.actionText}>Add Crop</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Crops')}
              >
                <Text style={styles.actionIcon}>🌾</Text>
                <Text style={styles.actionText}>My Crops</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Crops')}
              >
                <Text style={styles.actionIcon}>🛒</Text>
                <Text style={styles.actionText}>Browse Crops</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Orders')}
              >
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionText}>My Orders</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        {stats?.recent_orders?.length > 0 ? (
          stats.recent_orders.map((order) => (
            <Card
              key={order.id}
              title={order.crop_name}
              subtitle={isFarmer() ? `Buyer: ${order.buyer_name}` : `Farmer: ${order.farmer_name}`}
              price={order.total_price}
              quantity={order.quantity}
              unit={order.unit}
              status={order.status}
              onPress={() => navigation.navigate('Orders', { 
                screen: 'OrderDetail',
                params: { orderId: order.id }
              })}
              style={styles.orderCard}
            />
          ))
        ) : (
          <View style={styles.emptyOrders}>
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        )}
      </View>
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
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  role: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  orderCard: {
    marginBottom: 12,
  },
  emptyOrders: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default DashboardScreen;
