import 'dart:convert';
import 'dart:io';
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import 'api_service.dart';

/// Authentication Service
class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final ApiService _apiService = ApiService();

  // Current user
  User? _currentUser;

  /// Get current user
  User? get currentUser => _currentUser;

  /// Check if user is logged in
  bool get isLoggedIn => _currentUser != null;

  /// Check if current user is admin
  bool get isAdmin => _currentUser?.isAdmin ?? false;

  /// Initialize auth service
  Future<void> initialize() async {
    await _loadUserFromStorage();
  }

  // ==================== Authentication Methods ====================

  /// Login user
  Future<ApiResponse<User>> login(String email, String password) async {
    final loginData = UserLogin(email: email, password: password);

    final response = await _apiService.post<Map<String, dynamic>>(
      AppConstants.login,
      data: loginData.toJson(),
    );

    if (response.success && response.data != null) {
      final user = User.fromJson(response.data!);
      await _saveUser(user);
      _currentUser = user;
      return ApiResponse<User>(
        success: true,
        message: response.message,
        data: user,
      );
    }

    return ApiResponse<User>(
      success: false,
      message: response.message,
      errors: response.errors,
    );
  }

  /// Register user
  Future<ApiResponse<User>> register(UserRegistration registrationData) async {
    final response = await _apiService.post<Map<String, dynamic>>(
      AppConstants.register,
      data: registrationData.toJson(),
    );

    if (response.success && response.data != null) {
      final user = User.fromJson(response.data!);
      await _saveUser(user);
      _currentUser = user;
      return ApiResponse<User>(
        success: true,
        message: response.message,
        data: user,
      );
    }

    return ApiResponse<User>(
      success: false,
      message: response.message,
      errors: response.errors,
    );
  }

  /// Logout user
  Future<void> logout() async {
    try {
      await _apiService.post(AppConstants.logout);
    } catch (e) {
      // Ignore error, still clear local data
    } finally {
      await _clearUserData();
      _currentUser = null;
    }
  }

  /// Refresh token
  Future<bool> refreshToken() async {
    try {
      final refreshToken = await _getRefreshToken();
      if (refreshToken == null) return false;

      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.refreshToken,
        data: {'refresh_token': refreshToken},
      );

      if (response.success && response.data != null) {
        final newToken = response.data!['token'];
        final newRefreshToken = response.data!['refresh_token'];
        await _saveToken(newToken);
        await _saveRefreshToken(newRefreshToken);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Forgot password
  Future<ApiResponse<void>> forgotPassword(String email) async {
    return await _apiService.post(
      AppConstants.forgotPassword,
      data: {'email': email},
    );
  }

  /// Reset password
  Future<ApiResponse<void>> resetPassword(
    String token,
    String newPassword,
  ) async {
    return await _apiService.post(
      AppConstants.resetPassword,
      data: {
        'token': token,
        'password': newPassword,
      },
    );
  }

  /// Change password
  Future<ApiResponse<void>> changePassword(
    String currentPassword,
    String newPassword,
  ) async {
    return await _apiService.post(
      AppConstants.changePassword,
      data: {
        'current_password': currentPassword,
        'new_password': newPassword,
      },
    );
  }

  /// Verify email
  Future<ApiResponse<void>> verifyEmail(String token) async {
    return await _apiService.post(
      AppConstants.verifyEmail,
      data: {'token': token},
    );
  }

  // ==================== User Profile Methods ====================

  /// Get user profile
  Future<ApiResponse<User>> getProfile() async {
    final response = await _apiService.get<Map<String, dynamic>>(
      AppConstants.userProfile,
    );

    if (response.success && response.data != null) {
      final user = User.fromJson(response.data!);
      _currentUser = user;
      await _saveUserToPrefs(user);
      return ApiResponse<User>(
        success: true,
        message: response.message,
        data: user,
      );
    }

    return ApiResponse<User>(
      success: false,
      message: response.message,
      errors: response.errors,
    );
  }

  /// Update user profile
  Future<ApiResponse<User>> updateProfile(Map<String, dynamic> data) async {
    final response = await _apiService.put<Map<String, dynamic>>(
      AppConstants.updateProfile,
      data: data,
    );

    if (response.success && response.data != null) {
      final user = User.fromJson(response.data!);
      _currentUser = user;
      await _saveUserToPrefs(user);
      return ApiResponse<User>(
        success: true,
        message: response.message,
        data: user,
      );
    }

    return ApiResponse<User>(
      success: false,
      message: response.message,
      errors: response.errors,
    );
  }

  /// Upload avatar
  Future<ApiResponse<String>> uploadAvatar(String filePath) async {
    final response = await _apiService.uploadFile<Map<String, dynamic>>(
      AppConstants.uploadAvatar,
      file: File(filePath),
      fieldName: 'avatar',
    );

    if (response.success && response.data != null) {
      final avatarUrl = response.data!['avatar_url'] as String;
      if (_currentUser != null) {
        _currentUser = _currentUser!.copyWith(avatar: avatarUrl);
        await _saveUserToPrefs(_currentUser!);
      }
      return ApiResponse<String>(
        success: true,
        message: response.message,
        data: avatarUrl,
      );
    }

    return ApiResponse<String>(
      success: false,
      message: response.message,
      errors: response.errors,
    );
  }

  // ==================== Local Storage Methods ====================

  /// Save user data
  Future<void> _saveUser(User user) async {
    await _saveToken(user.token);
    await _saveUserToPrefs(user);
  }

  /// Save token to storage
  Future<void> _saveToken(String? token) async {
    if (token == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.prefToken, token);
  }

  /// Save refresh token to storage
  Future<void> _saveRefreshToken(String? token) async {
    if (token == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.prefRefreshToken, token);
  }

  /// Save user to preferences
  Future<void> _saveUserToPrefs(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.prefUser, jsonEncode(user.toJson()));
    await prefs.setBool(AppConstants.prefIsLoggedIn, true);
  }

  /// Get token from storage
  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.prefToken);
  }

  /// Get refresh token from storage
  Future<String?> _getRefreshToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(AppConstants.prefRefreshToken);
  }

  /// Load user from storage
  Future<void> _loadUserFromStorage() async {
    final prefs = await SharedPreferences.getInstance();
    final userJson = prefs.getString(AppConstants.prefUser);
    final isLoggedIn = prefs.getBool(AppConstants.prefIsLoggedIn) ?? false;

    if (isLoggedIn && userJson != null) {
      try {
        final user = User.fromJson(jsonDecode(userJson));

        // Check if token is expired
        final token = await getToken();
        if (token != null && !JwtDecoder.isExpired(token)) {
          _currentUser = user;
        } else {
          // Token expired, try to refresh
          final refreshed = await refreshToken();
          if (!refreshed) {
            await _clearUserData();
          }
        }
      } catch (e) {
        await _clearUserData();
      }
    }
  }

  /// Clear user data
  Future<void> _clearUserData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.prefToken);
    await prefs.remove(AppConstants.prefRefreshToken);
    await prefs.remove(AppConstants.prefUser);
    await prefs.setBool(AppConstants.prefIsLoggedIn, false);
    _currentUser = null;
  }

  /// Check if token is valid
  Future<bool> isTokenValid() async {
    final token = await getToken();
    if (token == null) return false;
    return !JwtDecoder.isExpired(token);
  }
}
