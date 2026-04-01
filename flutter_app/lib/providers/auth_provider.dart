import 'package:flutter/foundation.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Authentication Provider - Manages authentication state
class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final ApiService _apiService = ApiService();

  // State
  User? _user;
  bool _isLoading = false;
  String? _error;
  bool _isInitialized = false;

  // Getters
  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isInitialized => _isInitialized;
  bool get isLoggedIn => _user != null;
  bool get isAdmin => _user?.isAdmin ?? false;
  bool get isFarmer => _user?.isFarmer ?? false;
  bool get isBuyer => _user?.isBuyer ?? false;

  /// Initialize provider
  Future<void> initialize() async {
    if (_isInitialized) return;

    _setLoading(true);
    await _authService.initialize();
    _user = _authService.currentUser;
    _isInitialized = true;
    _setLoading(false);
  }

  /// Login user
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _authService.login(email, password);

      if (response.success && response.data != null) {
        _user = response.data;
        _setLoading(false);
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Login failed. Please try again.');
      return false;
    }
  }

  /// Register user
  Future<bool> register(UserRegistration registrationData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _authService.register(registrationData);

      if (response.success && response.data != null) {
        _user = response.data;
        _setLoading(false);
        return true;
      } else {
        _setError(response.message);
        if (response.hasErrors) {
          _setError(response.errorMessages.join('\n'));
        }
        return false;
      }
    } catch (e) {
      _setError('Registration failed. Please try again.');
      return false;
    }
  }

  /// Logout user
  Future<void> logout() async {
    _setLoading(true);

    try {
      await _authService.logout();
      _user = null;
      _setLoading(false);
    } catch (e) {
      _setLoading(false);
    }
  }

  /// Update profile
  Future<bool> updateProfile(Map<String, dynamic> data) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _authService.updateProfile(data);

      if (response.success && response.data != null) {
        _user = response.data;
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Profile update failed. Please try again.');
      return false;
    }
  }

  /// Upload avatar
  Future<bool> uploadAvatar(String filePath) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _authService.uploadAvatar(filePath);

      if (response.success && response.data != null) {
        _user = _user?.copyWith(avatar: response.data);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Avatar upload failed. Please try again.');
      return false;
    }
  }

  /// Change password
  Future<bool> changePassword(String currentPassword, String newPassword) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _authService.changePassword(
        currentPassword,
        newPassword,
      );

      if (response.success) {
        _setLoading(false);
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Password change failed. Please try again.');
      return false;
    }
  }

  /// Forgot password
  Future<bool> forgotPassword(String email) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _authService.forgotPassword(email);

      if (response.success) {
        _setLoading(false);
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Request failed. Please try again.');
      return false;
    }
  }

  /// Refresh user profile
  Future<void> refreshProfile() async {
    try {
      final response = await _authService.getProfile();
      if (response.success && response.data != null) {
        _user = response.data;
        notifyListeners();
      }
    } catch (e) {
      // Silently fail
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
    _user = null;
    _isLoading = false;
    _error = null;
    _isInitialized = false;
    notifyListeners();
  }
}
