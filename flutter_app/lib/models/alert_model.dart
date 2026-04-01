import '../constants/app_constants.dart';

/// Alert Model
class Alert {
  final int id;
  final String title;
  final String message;
  final String type;
  final int? createdBy;
  final String? createdByName;
  final bool isApproved;
  final int? approvedBy;
  final DateTime? approvedAt;
  final DateTime? expiresAt;
  final bool isRead;
  final DateTime createdAt;
  final DateTime updatedAt;

  Alert({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.createdBy,
    this.createdByName,
    required this.isApproved,
    this.approvedBy,
    this.approvedAt,
    this.expiresAt,
    required this.isRead,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Check if alert is info type
  bool get isInfo => type == AppConstants.alertTypeInfo;

  /// Check if alert is warning type
  bool get isWarning => type == AppConstants.alertTypeWarning;

  /// Check if alert is danger type
  bool get isDanger => type == AppConstants.alertTypeDanger;

  /// Check if alert is success type
  bool get isSuccess => type == AppConstants.alertTypeSuccess;

  /// Check if alert is expired
  bool get isExpired {
    if (expiresAt == null) return false;
    return DateTime.now().isAfter(expiresAt!);
  }

  /// Get type display name
  String get typeDisplay {
    switch (type) {
      case 'info':
        return 'Information';
      case 'warning':
        return 'Warning';
      case 'danger':
        return 'Urgent';
      case 'success':
        return 'Success';
      default:
        return type;
    }
  }

  factory Alert.fromJson(Map<String, dynamic> json) {
    return Alert(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? AppConstants.alertTypeInfo,
      createdBy: json['created_by'],
      createdByName: json['created_by_name'],
      isApproved: json['is_approved'] ?? false,
      approvedBy: json['approved_by'],
      approvedAt: json['approved_at'] != null
          ? DateTime.parse(json['approved_at'])
          : null,
      expiresAt: json['expires_at'] != null
          ? DateTime.parse(json['expires_at'])
          : null,
      isRead: json['is_read'] ?? false,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type,
      'created_by': createdBy,
      'created_by_name': createdByName,
      'is_approved': isApproved,
      'approved_by': approvedBy,
      'approved_at': approvedAt?.toIso8601String(),
      'expires_at': expiresAt?.toIso8601String(),
      'is_read': isRead,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Alert copyWith({
    int? id,
    String? title,
    String? message,
    String? type,
    int? createdBy,
    String? createdByName,
    bool? isApproved,
    int? approvedBy,
    DateTime? approvedAt,
    DateTime? expiresAt,
    bool? isRead,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Alert(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      type: type ?? this.type,
      createdBy: createdBy ?? this.createdBy,
      createdByName: createdByName ?? this.createdByName,
      isApproved: isApproved ?? this.isApproved,
      approvedBy: approvedBy ?? this.approvedBy,
      approvedAt: approvedAt ?? this.approvedAt,
      expiresAt: expiresAt ?? this.expiresAt,
      isRead: isRead ?? this.isRead,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Alert Create Data
class AlertCreateData {
  final String title;
  final String message;
  final String type;
  final DateTime? expiresAt;

  AlertCreateData({
    required this.title,
    required this.message,
    this.type = AppConstants.alertTypeInfo,
    this.expiresAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'message': message,
      'type': type,
      'expires_at': expiresAt?.toIso8601String(),
    };
  }
}
