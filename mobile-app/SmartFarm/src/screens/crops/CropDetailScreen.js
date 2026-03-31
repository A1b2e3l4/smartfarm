/**
 * SmartFarm - Crop Detail Screen
 * 
 * Shows detailed information about a crop.
 * Allows buyers to place orders and farmers to edit/delete.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Image,
  Alert,
  TouchableOpacity
} from 'react-native';
import { COLORS } from '../../App';
import { useAuth } from '../../context/AuthContext';
import cropService from '../../services/cropService';
import orderService from '../../services/orderService';

// Components
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import Input from '../../components/Input';

const CropDetailScreen = ({ route, navigation }) => {
  const { cropId } = route.params;
  const { user, isFarmer, isBuyer } = useAuth();
  
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    fetchCropDetails();
  }, [cropId]);

  const fetchCropDetails = async () => {
    try {
      const response = await cropService.getCropById(cropId);
      if (response.success) {
        setCrop(response.data);
        // Set default quantity to 1
        setOrderQuantity('1');
      }
    } catch (error) {
      console.error('Error fetching crop:', error);
      Alert.alert('Error', 'Failed to load crop details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    const quantity = parseFloat(orderQuantity);
    
    if (!quantity || quantity <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
      return;
    }

    if (quantity > crop.quantity) {
      Alert.alert('Insufficient Stock', `Only ${crop.quantity} ${crop.unit} available`);
      return;
    }

    setOrderLoading(true);
    try {
      const response = await orderService.createOrder({
        crop_id: cropId,
        quantity: quantity,
      });

      if (response.success) {
        Alert.alert(
          'Order Placed!',
          `Your order for ${quantity} ${crop.unit} of ${crop.name} has been placed successfully.`,
          [
            { 
              text: 'View Orders', 
              onPress: () => navigation.navigate('Orders') 
            },
            { 
              text: 'Continue Shopping', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleEditCrop = () => {
    navigation.navigate('AddCrop', { crop });
  };

  const handleDeleteCrop = () => {
    Alert.alert(
      'Delete Crop',
      'Are you sure you want to delete this crop? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await cropService.deleteCrop(cropId);
              Alert.alert('Deleted', 'Crop has been deleted successfully');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete crop');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen text="Loading crop details..." />;
  }

  if (!crop) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Crop not found</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const isOwnCrop = crop.farmer_id === user?.id;
  const totalPrice = (parseFloat(orderQuantity) || 0) * crop.price;

  return (
    <ScrollView style={styles.container}>
      {/* Crop Image */}
      {crop.image ? (
        <Image source={{ uri: crop.image }} style={styles.image} />
      ) : (
        <View style={styles.placeholderImage}>
          <Text style={styles.placeholderIcon}>🌾</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.name}>{crop.name}</Text>
            <Text style={styles.category}>{crop.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: crop.status === 'available' ? COLORS.success : COLORS.error }]}>
            <Text style={styles.statusText}>{crop.status}</Text>
          </View>
        </View>

        {/* Farmer Info */}
        <View style={styles.farmerCard}>
          <Text style={styles.farmerLabel}>Sold by</Text>
          <Text style={styles.farmerName}>{crop.farmer_name}</Text>
          {crop.farmer_phone && (
            <Text style={styles.farmerPhone}>📞 {crop.farmer_phone}</Text>
          )}
        </View>

        {/* Price and Quantity */}
        <View style={styles.priceContainer}>
          <View>
            <Text style={styles.priceLabel}>Price</Text>
            <Text style={styles.price}>${parseFloat(crop.price).toFixed(2)}</Text>
            <Text style={styles.unit}>per {crop.unit}</Text>
          </View>
          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>Available</Text>
            <Text style={styles.stock}>{crop.quantity} {crop.unit}</Text>
          </View>
        </View>

        {/* Description */}
        {crop.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{crop.description}</Text>
          </View>
        )}

        {/* Actions */}
        {isBuyer() && crop.status === 'available' && !isOwnCrop && (
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Place Order</Text>
            <Input
              label={`Quantity (${crop.unit})`}
              placeholder="Enter quantity"
              value={orderQuantity}
              onChangeText={setOrderQuantity}
              keyboardType="decimal-pad"
            />
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
            </View>
            <Button
              title="Place Order"
              onPress={handlePlaceOrder}
              loading={orderLoading}
              disabled={orderLoading || !orderQuantity}
              variant="primary"
              size="large"
            />
          </View>
        )}

        {/* Farmer Actions */}
        {isFarmer() && isOwnCrop && (
          <View style={styles.farmerActions}>
            <Button
              title="Edit Crop"
              onPress={handleEditCrop}
              variant="secondary"
              size="large"
              style={styles.actionButton}
            />
            <Button
              title="Delete Crop"
              onPress={handleDeleteCrop}
              variant="danger"
              size="large"
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Unavailable Message */}
        {crop.status !== 'available' && (
          <View style={styles.unavailableContainer}>
            <Text style={styles.unavailableText}>
              This crop is currently {crop.status}
            </Text>
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
  image: {
    width: '100%',
    height: 280,
  },
  placeholderImage: {
    width: '100%',
    height: 280,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 80,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: COLORS.gray,
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  farmerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  farmerLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  farmerPhone: {
    fontSize: 14,
    color: COLORS.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  unit: {
    fontSize: 12,
    color: COLORS.gray,
  },
  stockContainer: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  stock: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 22,
  },
  orderSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  farmerActions: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 12,
  },
  unavailableContainer: {
    backgroundColor: COLORS.error + '20',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
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

export default CropDetailScreen;
