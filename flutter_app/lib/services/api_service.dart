import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import 'auth_service.dart';

/// API Service - Handles all HTTP requests
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late Dio _dio;
  final AuthService _authService = AuthService();

  // Base URL - Should be loaded from environment variables
  String get baseUrl {
    // In production, this should come from .env file
    return const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'https://your-render-api.onrender.com/api',
    );
  }

  /// Initialize the API service
  void initialize() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(milliseconds: AppConstants.connectionTimeout),
        receiveTimeout: const Duration(milliseconds: AppConstants.receiveTimeout),
        sendTimeout: const Duration(milliseconds: AppConstants.sendTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add interceptors
    _dio.interceptors.add(_authInterceptor());
    _dio.interceptors.add(_logInterceptor());
  }

  /// Authentication interceptor
  Interceptor _authInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) async {
        // Add auth token to headers
        final token = await _authService.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        // Handle 401 Unauthorized - Token expired
        if (error.response?.statusCode == 401) {
          final refreshed = await _authService.refreshToken();
          if (refreshed) {
            // Retry the request with new token
            final token = await _authService.getToken();
            error.requestOptions.headers['Authorization'] = 'Bearer $token';
            return handler.resolve(await _dio.fetch(error.requestOptions));
          } else {
            // Token refresh failed, logout user
            await _authService.logout();
          }
        }
        return handler.next(error);
      },
    );
  }

  /// Logging interceptor for debugging
  Interceptor _logInterceptor() {
    return InterceptorsWrapper(
      onRequest: (options, handler) {
        if (kDebugMode) {
          print('┌── Request ──────────────────────────────');
          print('│ ${options.method} ${options.uri}');
          print('│ Headers: ${options.headers}');
          print('│ Data: ${options.data}');
          print('└─────────────────────────────────────────');
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        if (kDebugMode) {
          print('┌── Response ─────────────────────────────');
          print('│ Status: ${response.statusCode}');
          print('│ Data: ${response.data}');
          print('└─────────────────────────────────────────');
        }
        return handler.next(response);
      },
      onError: (error, handler) {
        if (kDebugMode) {
          print('┌── Error ────────────────────────────────');
          print('│ Status: ${error.response?.statusCode}');
          print('│ Message: ${error.message}');
          print('│ Data: ${error.response?.data}');
          print('└─────────────────────────────────────────');
        }
        return handler.next(error);
      },
    );
  }

  // ==================== HTTP Methods ====================

  /// GET request
  Future<ApiResponse<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
      );
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    }
  }

  /// POST request
  Future<ApiResponse<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    }
  }

  /// PUT request
  Future<ApiResponse<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    }
  }

  /// PATCH request
  Future<ApiResponse<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    }
  }

  /// DELETE request
  Future<ApiResponse<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    }
  }

  /// Upload file with multipart form data
  Future<ApiResponse<T>> uploadFile<T>(
    String path, {
    required File file,
    String fieldName = 'file',
    Map<String, dynamic>? additionalData,
    T Function(dynamic)? fromJson,
    void Function(int, int)? onSendProgress,
  }) async {
    try {
      final fileName = file.path.split('/').last;
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        ),
        if (additionalData != null) ...additionalData,
      });

      final response = await _dio.post(
        path,
        data: formData,
        onSendProgress: onSendProgress,
      );
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    }
  }

  /// Upload multiple files
  Future<ApiResponse<T>> uploadMultipleFiles<T>(
    String path, {
    required List<File> files,
    String fieldName = 'files',
    Map<String, dynamic>? additionalData,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final Map<String, dynamic> formMap = {};

      for (var i = 0; i < files.length; i++) {
        final fileName = files[i].path.split('/').last;
        formMap['${fieldName}[$i]'] = await MultipartFile.fromFile(
          files[i].path,
          filename: fileName,
        );
      }

      if (additionalData != null) {
        formMap.addAll(additionalData);
      }

      final formData = FormData.fromMap(formMap);
      final response = await _dio.post(path, data: formData);
      return _handleResponse<T>(response, fromJson);
    } on DioException catch (e) {
      return _handleError<T>(e);
    }
  }

  // ==================== Response Handling ====================

  /// Handle successful response
  ApiResponse<T> _handleResponse<T>(
    Response response,
    T Function(dynamic)? fromJson,
  ) {
    if (response.statusCode! >= 200 && response.statusCode! < 300) {
      return ApiResponse<T>.fromJson(
        response.data is Map<String, dynamic>
            ? response.data
            : {'success': true, 'data': response.data, 'message': 'Success'},
        fromJson,
      );
    } else {
      return ApiResponse<T>(
        success: false,
        message: response.data['message'] ?? 'Request failed',
        errors: response.data['errors'],
      );
    }
  }

  /// Handle error response
  ApiResponse<T> _handleError<T>(DioException error) {
    String message = ApiMessages.unknownError;
    Map<String, dynamic>? errors;
    int? statusCode = error.response?.statusCode;

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        message = ApiMessages.timeoutError;
        break;
      case DioExceptionType.badResponse:
        if (error.response?.data != null) {
          message = error.response?.data['message'] ?? message;
          errors = error.response?.data['errors'] != null
              ? Map<String, dynamic>.from(error.response!.data['errors'])
              : null;
        }
        break;
      case DioExceptionType.connectionError:
        message = ApiMessages.networkError;
        break;
      default:
        message = error.message ?? message;
    }

    // Handle specific status codes
    switch (statusCode) {
      case 401:
        message = ApiMessages.unauthorized;
        break;
      case 403:
        message = ApiMessages.forbidden;
        break;
      case 404:
        message = ApiMessages.notFound;
        break;
      case 422:
        message = ApiMessages.validationError;
        break;
      case 500:
        message = ApiMessages.serverError;
        break;
    }

    return ApiResponse<T>(
      success: false,
      message: message,
      errors: errors,
    );
  }

  /// Get paginated response
  Future<PaginatedResponse<T>?> getPaginated<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    required T Function(dynamic) fromJson,
  }) async {
    final response = await get<Map<String, dynamic>>(
      path,
      queryParameters: queryParameters,
    );

    if (response.success && response.data != null) {
      return PaginatedResponse<T>.fromJson(
        response.data!,
        fromJson,
      );
    }
    return null;
  }
}
