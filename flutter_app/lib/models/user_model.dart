import '../constants/app_constants.dart';

/// User Model
class User {
  final int id;
  final String name;
  final String email;
  final String phone;
  final String? avatar;
  final String role;
  final String county;
  final String? subCounty;
  final String? location;
  final bool isActive;
  final bool isVerified;
  final DateTime? emailVerifiedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? token;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    this.avatar,
    required this.role,
    required this.county,
    this.subCounty,
    this.location,
    required this.isActive,
    required this.isVerified,
    this.emailVerifiedAt,
    required this.createdAt,
    required this.updatedAt,
    this.token,
  });

  /// Check if user is admin
  bool get isAdmin => role == AppConstants.roleAdmin;

  /// Check if user is farmer
  bool get isFarmer => role == AppConstants.roleFarmer;

  /// Check if user is buyer
  bool get isBuyer => role == AppConstants.roleBuyer;

  /// Get full location string
  String get fullLocation {
    if (subCounty != null && subCounty!.isNotEmpty) {
      return '$subCounty, $county';
    }
    return county;
  }

  /// Factory constructor from JSON
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      avatar: json['avatar'],
      role: json['role'] ?? AppConstants.roleBuyer,
      county: json['county'] ?? '',
      subCounty: json['sub_county'],
      location: json['location'],
      isActive: json['is_active'] ?? true,
      isVerified: json['is_verified'] ?? false,
      emailVerifiedAt: json['email_verified_at'] != null
          ? DateTime.parse(json['email_verified_at'])
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
      token: json['token'],
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'avatar': avatar,
      'role': role,
      'county': county,
      'sub_county': subCounty,
      'location': location,
      'is_active': isActive,
      'is_verified': isVerified,
      'email_verified_at': emailVerifiedAt?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'token': token,
    };
  }

  /// Create a copy with updated fields
  User copyWith({
    int? id,
    String? name,
    String? email,
    String? phone,
    String? avatar,
    String? role,
    String? county,
    String? subCounty,
    String? location,
    bool? isActive,
    bool? isVerified,
    DateTime? emailVerifiedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? token,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      avatar: avatar ?? this.avatar,
      role: role ?? this.role,
      county: county ?? this.county,
      subCounty: subCounty ?? this.subCounty,
      location: location ?? this.location,
      isActive: isActive ?? this.isActive,
      isVerified: isVerified ?? this.isVerified,
      emailVerifiedAt: emailVerifiedAt ?? this.emailVerifiedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      token: token ?? this.token,
    );
  }

  @override
  String toString() {
    return 'User(id: $id, name: $name, email: $email, role: $role)';
  }
}

/// User Registration Data
class UserRegistration {
  final String name;
  final String email;
  final String phone;
  final String password;
  final String county;
  final String? subCounty;
  final String? location;
  final String role;

  UserRegistration({
    required this.name,
    required this.email,
    required this.phone,
    required this.password,
    required this.county,
    this.subCounty,
    this.location,
    this.role = AppConstants.roleBuyer,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'phone': phone,
      'password': password,
      'county': county,
      'sub_county': subCounty,
      'location': location,
      'role': role,
    };
  }
}

/// User Login Data
class UserLogin {
  final String email;
  final String password;

  UserLogin({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}

/// User Statistics
class UserStats {
  final int totalFarmers;
  final int totalBuyers;
  final int totalCrops;
  final int totalOrders;
  final int pendingApprovals;
  final double totalRevenue;

  UserStats({
    required this.totalFarmers,
    required this.totalBuyers,
    required this.totalCrops,
    required this.totalOrders,
    required this.pendingApprovals,
    required this.totalRevenue,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) {
    return UserStats(
      totalFarmers: json['total_farmers'] ?? 0,
      totalBuyers: json['total_buyers'] ?? 0,
      totalCrops: json['total_crops'] ?? 0,
      totalOrders: json['total_orders'] ?? 0,
      pendingApprovals: json['pending_approvals'] ?? 0,
      totalRevenue: (json['total_revenue'] ?? 0).toDouble(),
    );
  }
}
