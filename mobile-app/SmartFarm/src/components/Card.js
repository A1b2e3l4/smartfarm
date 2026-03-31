/**
 * SmartFarm - Reusable Card Component
 * 
 * A customizable card component for displaying crops, orders, and other content.
 */

import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { COLORS } from '../App';

const Card = ({ 
  title,
  subtitle,
  description,
  image,
  price,
  quantity,
  unit,
  status,
  onPress,
  style = {},
  children,
  footer
}) => {
  // Get status color
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'delivered':
      case 'active':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'sold':
      case 'out_of_stock':
      case 'canceled':
      case 'suspended':
        return COLORS.error;
      case 'accepted':
        return COLORS.primary;
      default:
        return COLORS.gray;
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.card, style]}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      {/* Image */}
      {image && (
        <Image 
          source={{ uri: image }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && <Text style={styles.title} numberOfLines={2}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
          </View>
          {status && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          )}
        </View>
        
        {/* Description */}
        {description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        
        {/* Price and Quantity */}
        {(price !== undefined || quantity !== undefined) && (
          <View style={styles.detailsRow}>
            {price !== undefined && (
              <Text style={styles.price}>${parseFloat(price).toFixed(2)}</Text>
            )}
            {quantity !== undefined && (
              <Text style={styles.quantity}>
                {quantity} {unit || 'units'}
              </Text>
            )}
          </View>
        )}
        
        {/* Custom children */}
        {children}
      </View>
      
      {/* Footer */}
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantity: {
    fontSize: 14,
    color: COLORS.gray,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    padding: 12,
  },
});

export default Card;
