/**
 * SmartFarm - Order Detail Screen
 * 
 * Shows detailed information about an order.
 * Allows farmers to update order status and buyers to cancel orders.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Alert,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../../App';
import { useAuth } from '../../context/AuthContext';
import orderService from '../../services/orderService';

// Components
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Card from '../../components/Card';

const OrderDetailScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { user, isFarmer, isBuyer } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderService.getOrderById(orderId);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setActionLoading(true);
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        setOrder(response.data);
        Alert.alert('Success', `Order ${newStatus} successfully`);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => handleUpdateStatus('canceled')
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'accepted':
        return COLORS.primary;
      case 'delivered':
        return COLORS.success;
      case 'canceled':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'accepted':
        return '✅';
      case 'delivered':
        return '📦';
      case 'canceled':
        return '❌';
      default:
        return '📋';
    }
  };

  const renderActionButtons = () => {
    if (!order) return null;

    const isOutgoing = order.buyer_id === user?.id;
    const canCancel = order.status === 'pending' || order.status === 'accepted';

    // Farmer actions
    if (isFarmer() && !isOutgoing) {
      if (order.status === 'pending') {
        return (
          <View style={styles.actionsContainer}>
            <Button
              title="Accept Order"
              onPress={() => handleUpdateStatus('accepted')}
              loading={actionLoading}
              variant="success"
              size="large"
              style={styles.actionButton}
            />
            <Button
              title="Cancel Order"
              onPress={handleCancelOrder}
              loading={actionLoading}
              variant="danger"
              size="large"
              style={styles.actionButton}
            />
          </View>
        );
      } else if (order.status === 'accepted') {
        return (
          <View style={styles.actionsContainer}>
            <Button
              title="Mark as Delivered"
              onPress={() => handleUpdateStatus('delivered')}
              loading={actionLoading}
              variant="primary"
              size="large"
              style={styles.actionButton}
            />
          </View>
        );
      }
    }

    // Buyer actions
    if (isBuyer() && isOutgoing && canCancel) {
      return (
        <View style={styles.actionsContainer}>
          <Button
            title="Cancel Order"
            onPress={handleCancelOrder}
            loading={actionLoading}
            variant="danger"
            size="large"
            style={styles.actionButton}
          />
        </View>
      );
    }

    return null;
  };

  if (loading) {
    return <Loading fullScreen text="Loading order details..." />;
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isOutgoing = order.buyer_id === user?.id;

  return (
    <ScrollView style={styles.container}>
      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: getStatusColor(order.status) }]}>
        <Text style={styles.statusIcon}>{getStatusIcon(order.status)}</Text>
        <Text style={styles.statusTitle}>
          Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Text>
        <Text style={styles.statusSubtitle}>
          Placed on {new Date(order.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Crop Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop Details</Text>
          <Card
            title={order.crop_name}
            subtitle={isOutgoing ? `From: ${order.farmer_name}` : `To: ${order.buyer_name}`}
            price={order.total_price}
            quantity={order.quantity}
            unit={order.unit}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Quantity</Text>
              <Text style={styles.summaryValue}>
                {order.quantity} {order.unit}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price per {order.unit}</Text>
              <Text style={styles.summaryValue}>
                ${(order.total_price / order.quantity).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ${parseFloat(order.total_price).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isOutgoing ? 'Farmer Contact' : 'Buyer Contact'}
          </Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactName}>
              {isOutgoing ? order.farmer_name : order.buyer_name}
            </Text>
            {(isOutgoing ? order.farmer_phone : order.buyer_phone) && (
              <Text style={styles.contactPhone}>
                📞 {isOutgoing ? order.farmer_phone : order.buyer_phone}
              </Text>
            )}
            <Text style={styles.contactEmail}>
              ✉️ {isOutgoing ? order.farmer_email : order.buyer_email}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        {order.delivery_address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressText}>{order.delivery_address}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Notes</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {renderActionButtons()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusHeader: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  statusSubtitle: {
    fontSize: 14,
    color: COLORS.white + 'CC',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  contactPhone: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  contactEmail: {
    fontSize: 14,
    color: COLORS.gray,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
  },
  notesCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.gray,
    marginBottom: 20,
  },
});

export default OrderDetailScreen;
