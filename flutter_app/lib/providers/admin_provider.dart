import 'package:flutter/foundation.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Admin Provider - Manages admin-specific state
class AdminProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  // State
  AdminDashboardStats? _dashboardStats;
  List<User> _users = [];
  List<AdminLog> _logs = [];
  List<CropProblem> _cropProblems = [];
  User? _selectedUser;
  bool _isLoading = false;
  String? _error;

  // Pagination
  int _currentPage = 1;
  int _lastPage = 1;

  // Getters
  AdminDashboardStats? get dashboardStats => _dashboardStats;
  List<User> get users => _users;
  List<AdminLog> get logs => _logs;
  List<CropProblem> get cropProblems => _cropProblems;
  User? get selectedUser => _selectedUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasMoreData => _currentPage < _lastPage;

  // ==================== Dashboard Operations ====================

  /// Fetch dashboard statistics
  Future<void> fetchDashboardStats() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        AppConstants.adminDashboard,
      );

      if (response.success && response.data != null) {
        _dashboardStats = AdminDashboardStats.fromJson(response.data!);
      }
    } catch (e) {
      _setError('Failed to load dashboard stats. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  // ==================== User Management ====================

  /// Fetch all users
  Future<void> fetchUsers({
    int page = 1,
    String? role,
    String? search,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final queryParams = <String, dynamic>{'page': page};
      if (role != null) queryParams['role'] = role;
      if (search != null) queryParams['search'] = search;

      final response = await _apiService.getPaginated<User>(
        AppConstants.adminUsers,
        queryParameters: queryParams,
        fromJson: (json) => User.fromJson(json),
      );

      if (response != null) {
        if (page == 1) {
          _users = response.data;
        } else {
          _users.addAll(response.data);
        }
        _currentPage = response.currentPage;
        _lastPage = response.lastPage;
      }
    } catch (e) {
      _setError('Failed to load users. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch user details
  Future<bool> fetchUserDetails(int userId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        '${AppConstants.users}/$userId',
      );

      if (response.success && response.data != null) {
        _selectedUser = User.fromJson(response.data!);
        _setLoading(false);
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to load user details. Please try again.');
      return false;
    }
  }

  /// Update user
  Future<bool> updateUser(int userId, Map<String, dynamic> data) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.put<Map<String, dynamic>>(
        '${AppConstants.users}/$userId',
        data: data,
      );

      if (response.success && response.data != null) {
        final updatedUser = User.fromJson(response.data!);

        // Update in list
        final index = _users.indexWhere((u) => u.id == userId);
        if (index != -1) {
          _users[index] = updatedUser;
        }

        if (_selectedUser?.id == userId) {
          _selectedUser = updatedUser;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to update user. Please try again.');
      return false;
    }
  }

  /// Suspend user
  Future<bool> suspendUser(int userId) async {
    return await updateUser(userId, {'is_active': false});
  }

  /// Activate user
  Future<bool> activateUser(int userId) async {
    return await updateUser(userId, {'is_active': true});
  }

  /// Delete user
  Future<bool> deleteUser(int userId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.delete(
        '${AppConstants.users}/$userId',
      );

      if (response.success) {
        _users.removeWhere((u) => u.id == userId);

        if (_selectedUser?.id == userId) {
          _selectedUser = null;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to delete user. Please try again.');
      return false;
    }
  }

  /// Change user role
  Future<bool> changeUserRole(int userId, String newRole) async {
    return await updateUser(userId, {'role': newRole});
  }

  // ==================== Admin Logs ====================

  /// Fetch admin logs
  Future<void> fetchLogs({
    int page = 1,
    String? action,
    String? entityType,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final queryParams = <String, dynamic>{'page': page};
      if (action != null) queryParams['action'] = action;
      if (entityType != null) queryParams['entity_type'] = entityType;
      if (startDate != null) {
        queryParams['start_date'] = startDate.toIso8601String();
      }
      if (endDate != null) {
        queryParams['end_date'] = endDate.toIso8601String();
      }

      final response = await _apiService.getPaginated<AdminLog>(
        AppConstants.adminLogs,
        queryParameters: queryParams,
        fromJson: (json) => AdminLog.fromJson(json),
      );

      if (response != null) {
        if (page == 1) {
          _logs = response.data;
        } else {
          _logs.addAll(response.data);
        }
        _currentPage = response.currentPage;
        _lastPage = response.lastPage;
      }
    } catch (e) {
      _setError('Failed to load logs. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  // ==================== Crop Problem Management ====================

  /// Fetch crop problems
  Future<void> fetchCropProblems({int page = 1}) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<CropProblem>(
        AppConstants.cropProblemHistory,
        queryParameters: {'page': page},
        fromJson: (json) => CropProblem.fromJson(json),
      );

      if (response != null) {
        if (page == 1) {
          _cropProblems = response.data;
        } else {
          _cropProblems.addAll(response.data);
        }
        _currentPage = response.currentPage;
        _lastPage = response.lastPage;
      }
    } catch (e) {
      _setError('Failed to load crop problems. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Update crop problem with solution
  Future<bool> updateCropProblemSolution(
    int problemId, {
    required String solution,
    String? treatment,
    String? prevention,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.put<Map<String, dynamic>>(
        '${AppConstants.cropProblemDetails}/$problemId',
        data: {
          'solution': solution,
          if (treatment != null) 'treatment': treatment,
          if (prevention != null) 'prevention': prevention,
          'status': 'analyzed',
        },
      );

      if (response.success && response.data != null) {
        final updatedProblem = CropProblem.fromJson(response.data!);

        // Update in list
        final index = _cropProblems.indexWhere((p) => p.id == problemId);
        if (index != -1) {
          _cropProblems[index] = updatedProblem;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to update crop problem. Please try again.');
      return false;
    }
  }

  // ==================== Private Methods ====================

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
    _dashboardStats = null;
    _users = [];
    _logs = [];
    _cropProblems = [];
    _selectedUser = null;
    _isLoading = false;
    _error = null;
    _currentPage = 1;
    _lastPage = 1;
    notifyListeners();
  }
}
