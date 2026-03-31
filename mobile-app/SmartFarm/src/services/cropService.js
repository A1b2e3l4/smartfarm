/**
 * SmartFarm - Crop Service
 * 
 * Handles all crop-related API calls:
 * - Get all crops
 * - Get crop by ID
 * - Create crop
 * - Update crop
 * - Delete crop
 * - Search crops
 */

import api from './api';

const cropService = {
  /**
   * Get all crops with optional filters
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {string} params.category - Filter by category
   * @param {string} params.farmer_id - Filter by farmer
   * @param {string} params.status - Filter by status
   * @param {number} params.min_price - Minimum price
   * @param {number} params.max_price - Maximum price
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} - API response
   */
  getCrops: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/crops?${queryString}` : '/crops';
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get single crop by ID
   * @param {string} id - Crop ID
   * @returns {Promise} - API response
   */
  getCropById: async (id) => {
    const response = await api.get(`/crops/${id}`);
    return response.data;
  },

  /**
   * Create new crop (farmer only)
   * @param {Object} cropData - Crop data
   * @param {string} cropData.name - Crop name
   * @param {string} cropData.category - Crop category
   * @param {number} cropData.price - Price per unit
   * @param {number} cropData.quantity - Available quantity
   * @param {string} cropData.unit - Unit (kg, lb, etc.)
   * @param {string} cropData.description - Description
   * @param {string} cropData.image - Image URL
   * @returns {Promise} - API response
   */
  createCrop: async (cropData) => {
    const response = await api.post('/crops', cropData);
    return response.data;
  },

  /**
   * Update crop
   * @param {string} id - Crop ID
   * @param {Object} cropData - Updated crop data
   * @returns {Promise} - API response
   */
  updateCrop: async (id, cropData) => {
    const response = await api.put(`/crops/${id}`, cropData);
    return response.data;
  },

  /**
   * Delete crop
   * @param {string} id - Crop ID
   * @returns {Promise} - API response
   */
  deleteCrop: async (id) => {
    const response = await api.delete(`/crops/${id}`);
    return response.data;
  },

  /**
   * Get farmer's crops
   * @param {string} farmerId - Farmer ID
   * @returns {Promise} - API response
   */
  getFarmerCrops: async (farmerId) => {
    const response = await api.get(`/crops?farmer_id=${farmerId}`);
    return response.data;
  },

  /**
   * Search crops
   * @param {string} searchTerm - Search term
   * @returns {Promise} - API response
   */
  searchCrops: async (searchTerm) => {
    const response = await api.get(`/crops?search=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  /**
   * Upload crop image (helper function)
   * @param {string} imageUri - Local image URI
   * @returns {Promise} - Upload response with image URL
   */
  uploadCropImage: async (imageUri) => {
    // This would typically upload to your server or cloud storage
    // For now, return a mock URL - implement based on your backend
    const formData = new FormData();
    
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    });
    
    // Upload to your image endpoint
    // const response = await api.post('/uploads/crop-image', formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' },
    // });
    
    // For now, return the local URI (replace with actual upload)
    return { success: true, imageUrl: imageUri };
  },
};

export default cropService;
