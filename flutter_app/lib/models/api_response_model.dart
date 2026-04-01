/// Generic API Response Model
class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;
  final Map<String, dynamic>? meta;
  final Map<String, dynamic>? errors;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.meta,
    this.errors,
  });

  /// Check if response has errors
  bool get hasErrors => errors != null && errors!.isNotEmpty;

  /// Get error messages as list
  List<String> get errorMessages {
    if (errors == null) return [];
    final List<String> messages = [];
    errors!.forEach((key, value) {
      if (value is List) {
        messages.addAll(value.map((e) => '$key: $e'));
      } else {
        messages.add('$key: $value');
      }
    });
    return messages;
  }

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? fromJson,
  ) {
    return ApiResponse<T>(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      data: fromJson != null && json['data'] != null
          ? fromJson(json['data'])
          : json['data'],
      meta: json['meta'] != null
          ? Map<String, dynamic>.from(json['meta'])
          : null,
      errors: json['errors'] != null
          ? Map<String, dynamic>.from(json['errors'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'data': data,
      'meta': meta,
      'errors': errors,
    };
  }
}

/// Paginated Response Model
class PaginatedResponse<T> {
  final List<T> data;
  final int currentPage;
  final int lastPage;
  final int perPage;
  final int total;
  final String? nextPageUrl;
  final String? prevPageUrl;

  PaginatedResponse({
    required this.data,
    required this.currentPage,
    required this.lastPage,
    required this.perPage,
    required this.total,
    this.nextPageUrl,
    this.prevPageUrl,
  });

  /// Check if there is a next page
  bool get hasNextPage => nextPageUrl != null && nextPageUrl!.isNotEmpty;

  /// Check if there is a previous page
  bool get hasPrevPage => prevPageUrl != null && prevPageUrl!.isNotEmpty;

  /// Check if current page is the first page
  bool get isFirstPage => currentPage == 1;

  /// Check if current page is the last page
  bool get isLastPage => currentPage == lastPage;

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic) fromJson,
  ) {
    return PaginatedResponse<T>(
      data: json['data'] != null
          ? List<T>.from(json['data'].map((x) => fromJson(x)))
          : [],
      currentPage: json['current_page'] ?? 1,
      lastPage: json['last_page'] ?? 1,
      perPage: json['per_page'] ?? 20,
      total: json['total'] ?? 0,
      nextPageUrl: json['next_page_url'],
      prevPageUrl: json['prev_page_url'],
    );
  }
}

/// API Error Model
class ApiError {
  final int code;
  final String message;
  final Map<String, dynamic>? details;

  ApiError({
    required this.code,
    required this.message,
    this.details,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code'] ?? 500,
      message: json['message'] ?? 'An error occurred',
      details: json['details'] != null
          ? Map<String, dynamic>.from(json['details'])
          : null,
    );
  }
}

/// Common API Error Codes
class ApiErrorCodes {
  ApiErrorCodes._();

  static const int success = 200;
  static const int created = 201;
  static const int badRequest = 400;
  static const int unauthorized = 401;
  static const int forbidden = 403;
  static const int notFound = 404;
  static const int validationError = 422;
  static const int serverError = 500;
  static const int serviceUnavailable = 503;
}

/// Common API Messages
class ApiMessages {
  ApiMessages._();

  static const String success = 'Success';
  static const String created = 'Created successfully';
  static const String updated = 'Updated successfully';
  static const String deleted = 'Deleted successfully';
  static const String notFound = 'Resource not found';
  static const String unauthorized = 'Unauthorized access';
  static const String forbidden = 'Forbidden access';
  static const String validationError = 'Validation error';
  static const String serverError = 'Internal server error';
  static const String networkError = 'Network error. Please check your connection';
  static const String timeoutError = 'Request timeout. Please try again';
  static const String unknownError = 'An unknown error occurred';
}
