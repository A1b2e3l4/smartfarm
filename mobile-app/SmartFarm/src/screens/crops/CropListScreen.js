/**
 * SmartFarm - Crop List Screen
 * 
 * Displays list of crops - either all crops for buyers
 * or farmer's own crops.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { COLORS } from '../../App';
import { useAuth } from '../../context/AuthContext';
import cropService from '../../services/cropService';

// Components
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import EmptyState from '../../components/EmptyState';

const CropListScreen = ({ navigation }) => {
  const { user, isFarmer } = useAuth();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchCrops = async (pageNum = 1, shouldRefresh = false) => {
    try {
      const params = {
        page: pageNum,
        limit: 10,
        status: 'available',
      };

      // If farmer, show only their crops
      if (isFarmer()) {
        params.farmer_id = user.id;
      }

      // Add search query if present
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await cropService.getCrops(params);
      
      if (response.success) {
        const newCrops = response.data.crops;
        
        if (shouldRefresh || pageNum === 1) {
          setCrops(newCrops);
        } else {
          setCrops(prev => [...prev, ...newCrops]);
        }
        
        setHasMore(newCrops.length === 10);
      }
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCrops(1, true);
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchCrops(1, true);
  }, [searchQuery]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchCrops(nextPage);
    }
  };

  const renderCropItem = ({ item }) => (
    <Card
      title={item.name}
      subtitle={`By ${item.farmer_name}`}
      description={item.description}
      image={item.image}
      price={item.price}
      quantity={item.quantity}
      unit={item.unit}
      status={item.status}
      onPress={() => navigation.navigate('CropDetail', { cropId: item.id })}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      icon={<Text style={{ fontSize: 60 }}>🌾</Text>}
      title={isFarmer() ? "No Crops Listed" : "No Crops Available"}
      message={
        isFarmer() 
          ? "Start selling by adding your first crop!"
          : "Check back later for fresh produce."
      }
      actionLabel={isFarmer() ? "Add Crop" : null}
      onAction={isFarmer() ? () => navigation.navigate('AddCrop') : null}
    />
  );

  if (loading && crops.length === 0) {
    return <Loading fullScreen text="Loading crops..." />;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search crops..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Button for Farmers */}
      {isFarmer() && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCrop')}
        >
          <Text style={styles.addButtonIcon}>➕</Text>
          <Text style={styles.addButtonText}>Add New Crop</Text>
        </TouchableOpacity>
      )}

      {/* Crop List */}
      <FlatList
        data={crops}
        renderItem={renderCropItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={
          loading && crops.length > 0 ? (
            <Loading text="Loading more..." />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.black,
  },
  clearIcon: {
    fontSize: 18,
    color: COLORS.gray,
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonIcon: {
    fontSize: 18,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
});

export default CropListScreen;
