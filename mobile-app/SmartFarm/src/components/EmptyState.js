/**
 * SmartFarm - Empty State Component
 * 
 * Displayed when there's no data to show.
 */

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet 
} from 'react-native';
import { COLORS } from '../App';
import Button from './Button';

const EmptyState = ({ 
  icon = null,
  title = 'No Data Found',
  message = 'There is nothing to display here yet.',
  actionLabel = null,
  onAction = null,
  style = {}
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionButton: {
    minWidth: 150,
  },
});

export default EmptyState;
