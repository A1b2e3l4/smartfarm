/**
 * SmartFarm - Order Service
 * 
 * Handles all order-related API calls:
 * - Get all orders
 * - Get order by ID
 * - Create order
 * - Update order status
 * - Cancel order
 */

import api from './api';

const orderService = {
  /**
   * Get all orders for current user
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} - API response
   */
  getOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const queryString = queryParams.toString();
    const url = queryString ? `/orders?${queryString}` : '/orders';
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get single order by ID
   * @param {string} id - Order ID
   * @returns {Promise} - API response
   */
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Create new order (buyer only)
   * @param {Object} orderData - Order data
   * @param {string} orderData.crop_id - Crop ID
   * @param {number} orderData.quantity - Order quantity
   * @param {string} orderData.delivery_address - Delivery address
   * @param {string} orderData.notes - Order notes
   * @returns {Promise} - API response
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {string} status - New status (pending, accepted, delivered, canceled)
   * @returns {Promise} - API response
   */
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
  },

  /**
   * Cancel order (buyer only)
   * @param {string} id - Order ID
   * @returns {Promise} - API response
   */
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}`, { status: 'canceled' });
    return response.data;
  },

  /**
   * Accept order (farmer only)
   * @param {string} id - Order ID
   * @returns {Promise} - API response
   */
  acceptOrder: async (id) => {
    const response = await api.put(`/orders/${id}`, { status: 'accepted' });
    return response.data;
  },

  /**
   * Mark order as delivered (farmer only)
   * @param {string} id - Order ID
   * @returns {Promise} - API response
   */
  deliverOrder: async (id) => {
    const response = await api.put(`/orders/${id}`, { status: 'delivered' });
    return response.data;
  },

  /**
   * Get pending orders
   * @returns {Promise} - API response
   */
  getPendingOrders: async () => {
    const response = await api.get('/orders?status=pending');
    return response.data;
  },

  /**
   * Get order history (delivered orders)
   * @returns {Promise} - API response
   */
  getOrderHistory: async () => {
    const response = await api.get('/orders?status=delivered');
    return response.data;
  },
};

export default orderService;
