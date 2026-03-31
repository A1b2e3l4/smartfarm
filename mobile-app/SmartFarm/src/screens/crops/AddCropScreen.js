/**
 * SmartFarm - Add/Edit Crop Screen
 * 
 * Allows farmers to add new crops or edit existing ones.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../App';
import cropService from '../../services/cropService';

// Components
import Input from '../../components/Input';
import Button from '../../components/Button';

const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Grains',
  'Legumes',
  'Dairy',
  'Meat',
  'Herbs',
  'Nuts',
  'Other'
];

const UNITS = ['kg', 'lb', 'g', 'oz', 'piece', 'bunch', 'dozen', 'liter', 'gallon'];

const AddCropScreen = ({ route, navigation }) => {
  const editingCrop = route.params?.crop;
  const isEditing = !!editingCrop;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load crop data if editing
  useEffect(() => {
    if (editingCrop) {
      setName(editingCrop.name || '');
      setCategory(editingCrop.category || 'Vegetables');
      setPrice(editingCrop.price?.toString() || '');
      setQuantity(editingCrop.quantity?.toString() || '');
      setUnit(editingCrop.unit || 'kg');
      setDescription(editingCrop.description || '');
      setImage(editingCrop.image || null);
    }
  }, [editingCrop]);

  // Request camera permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Crop name is required';
    }

    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price) || parseFloat(price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(quantity) || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const cropData = {
        name: name.trim(),
        category,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        unit,
        description: description.trim(),
        image,
      };

      let response;
      if (isEditing) {
        response = await cropService.updateCrop(editingCrop.id, cropData);
      } else {
        response = await cropService.createCrop(cropData);
      }

      if (response.success) {
        Alert.alert(
          isEditing ? 'Crop Updated!' : 'Crop Added!',
          isEditing 
            ? 'Your crop has been updated successfully.'
            : 'Your crop has been listed successfully.',
          [
            { 
              text: 'View Crops', 
              onPress: () => navigation.navigate('CropList')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} crop`
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCategorySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.selectorItem,
              category === cat && styles.selectorItemActive
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[
              styles.selectorText,
              category === cat && styles.selectorTextActive
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderUnitSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Unit</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {UNITS.map((u) => (
          <TouchableOpacity
            key={u}
            style={[
              styles.selectorItem,
              unit === u && styles.selectorItemActive
            ]}
            onPress={() => setUnit(u)}
          >
            <Text style={[
              styles.selectorText,
              unit === u && styles.selectorTextActive
            ]}>
              {u}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.selectedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>📷</Text>
              <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Crop Name *"
            placeholder="e.g., Organic Tomatoes"
            value={name}
            onChangeText={setName}
            error={errors.name}
          />

          {renderCategorySelector()}

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Input
                label="Price *"
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                error={errors.price}
              />
            </View>
            <View style={styles.halfInput}>
              <Input
                label="Quantity *"
                placeholder="0"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                error={errors.quantity}
              />
            </View>
          </View>

          {renderUnitSelector()}

          <Input
            label="Description"
            placeholder="Describe your crop..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Button
            title={isEditing ? 'Update Crop' : 'Add Crop'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            variant="primary"
            size="large"
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  selectorItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  selectorItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectorText: {
    fontSize: 14,
    color: COLORS.black,
  },
  selectorTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 20,
  },
});

export default AddCropScreen;
