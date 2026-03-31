/**
 * SmartFarm - Authentication Service
 * 
 * Handles all authentication-related API calls:
 * - Login
 * - Register
 * - Get Profile
 * - Update Profile
 * - Upload Profile Image
 */

import api from './api';

const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} - API response
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.role - User role (farmer/buyer)
   * @param {string} userData.phone - User phone (optional)
   * @param {string} userData.address - User address (optional)
   * @returns {Promise} - API response
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Get user profile
   * @returns {Promise} - API response
   */
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} - API response
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  /**
   * Upload profile image
   * @param {string} imageUri - Local image URI
   * @returns {Promise} - API response
   */
  uploadProfileImage: async (imageUri) => {
    // Create form data for file upload
    const formData = new FormData();
    
    // Get filename from URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    });
    
    const response = await api.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default authService;
