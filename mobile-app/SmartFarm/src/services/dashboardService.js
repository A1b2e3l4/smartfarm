/**
 * SmartFarm - Dashboard Service
 * 
 * Handles dashboard statistics API calls
 */

import api from './api';

const dashboardService = {
  /**
   * Get main dashboard statistics
   * @returns {Promise} - API response
   */
  getDashboardStats: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  /**
   * Get farmer-specific statistics
   * @returns {Promise} - API response
   */
  getFarmerStats: async () => {
    const response = await api.get('/dashboard/farmer');
    return response.data;
  },

  /**
   * Get buyer-specific statistics
   * @returns {Promise} - API response
   */
  getBuyerStats: async () => {
    const response = await api.get('/dashboard/buyer');
    return response.data;
  },
};

export default dashboardService;
