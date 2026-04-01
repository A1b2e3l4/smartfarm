import 'package:flutter/foundation.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Order Provider - Manages order-related state
class OrderProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  // State
  List<Order> _orders = [];
  List<Order> _myOrders = [];
  List<Order> _receivedOrders = [];
  Order? _selectedOrder;
  OrderStats? _stats;
  bool _isLoading = false;
  String? _error;

  // Pagination
  int _currentPage = 1;
  int _lastPage = 1;

  // Getters
  List<Order> get orders => _orders;
  List<Order> get myOrders => _myOrders;
  List<Order> get receivedOrders => _receivedOrders;
  Order? get selectedOrder => _selectedOrder;
  OrderStats? get stats => _stats;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMoreData => _currentPage < _lastPage;

  // ==================== Order Operations ====================

  /// Fetch all orders (admin)
  Future<void> fetchOrders({int page = 1}) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<Order>(
        AppConstants.orders,
        queryParameters: {'page': page},
        fromJson: (json) => Order.fromJson(json),
      );

      if (response != null) {
        if (page == 1) {
          _orders = response.data;
        } else {
          _orders.addAll(response.data);
        }
        _currentPage = response.currentPage;
        _lastPage = response.lastPage;
      }
    } catch (e) {
      _setError('Failed to load orders. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch my orders (as buyer)
  Future<void> fetchMyOrders() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<Order>(
        AppConstants.orderHistory,
        fromJson: (json) => Order.fromJson(json),
      );

      if (response != null) {
        _myOrders = response.data;
      }
    } catch (e) {
      _setError('Failed to load your orders. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch received orders (as farmer)
  Future<void> fetchReceivedOrders() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<Order>(
        '${AppConstants.orders}/received',
        fromJson: (json) => Order.fromJson(json),
      );

      if (response != null) {
        _receivedOrders = response.data;
      }
    } catch (e) {
      _setError('Failed to load received orders. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch order details
  Future<bool> fetchOrderDetails(int orderId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        '${AppConstants.orderDetails}/$orderId',
      );

      if (response.success && response.data != null) {
        _selectedOrder = Order.fromJson(response.data!);
        _setLoading(false);
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to load order details. Please try again.');
      return false;
    }
  }

  /// Create order
  Future<bool> createOrder(OrderCreateData orderData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.orderCreate,
        data: orderData.toJson(),
      );

      if (response.success && response.data != null) {
        final newOrder = Order.fromJson(response.data!);
        _myOrders.insert(0, newOrder);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        if (response.hasErrors) {
          _setError(response.errorMessages.join('\n'));
        }
        return false;
      }
    } catch (e) {
      _setError('Failed to create order. Please try again.');
      return false;
    }
  }

  /// Update order status
  Future<bool> updateOrderStatus(int orderId, String status) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.put<Map<String, dynamic>>(
        '${AppConstants.orderUpdate}/$orderId',
        data: {'status': status},
      );

      if (response.success && response.data != null) {
        final updatedOrder = Order.fromJson(response.data!);

        // Update in lists
        _updateOrderInList(_orders, updatedOrder);
        _updateOrderInList(_myOrders, updatedOrder);
        _updateOrderInList(_receivedOrders, updatedOrder);

        if (_selectedOrder?.id == orderId) {
          _selectedOrder = updatedOrder;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to update order. Please try again.');
      return false;
    }
  }

  /// Cancel order
  Future<bool> cancelOrder(int orderId, {String? reason}) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '${AppConstants.orderCancel}/$orderId',
        data: reason != null ? {'reason': reason} : null,
      );

      if (response.success && response.data != null) {
        final updatedOrder = Order.fromJson(response.data!);

        _updateOrderInList(_orders, updatedOrder);
        _updateOrderInList(_myOrders, updatedOrder);
        _updateOrderInList(_receivedOrders, updatedOrder);

        if (_selectedOrder?.id == orderId) {
          _selectedOrder = updatedOrder;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to cancel order. Please try again.');
      return false;
    }
  }

  /// Fetch order statistics
  Future<void> fetchOrderStats() async {
    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        AppConstants.orderHistory,
      );

      if (response.success && response.data != null) {
        _stats = OrderStats.fromJson(response.data!);
        notifyListeners();
      }
    } catch (e) {
      // Silently fail
    }
  }

  /// Clear selected order
  void clearSelectedOrder() {
    _selectedOrder = null;
    notifyListeners();
  }

  /// Refresh orders
  Future<void> refreshOrders() async {
    await fetchOrders(page: 1);
    await fetchMyOrders();
    await fetchReceivedOrders();
  }

  // ==================== Private Methods ====================

  void _updateOrderInList(List<Order> list, Order updatedOrder) {
    final index = list.indexWhere((o) => o.id == updatedOrder.id);
    if (index != -1) {
      list[index] = updatedOrder;
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _setError(String message) {
    _error = message;
    _isLoading = false;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
  }

  /// Clear all state (for testing)
  void clearState() {
    _orders = [];
    _myOrders = [];
    _receivedOrders = [];
    _selectedOrder = null;
    _stats = null;
    _isLoading = false;
    _error = null;
    _currentPage = 1;
    _lastPage = 1;
    notifyListeners();
  }
}
