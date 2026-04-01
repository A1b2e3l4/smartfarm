/// Admin Log Model - For audit trail
class AdminLog {
  final int id;
  final int adminId;
  final String adminName;
  final String action;
  final String entityType;
  final int? entityId;
  final String? entityName;
  final Map<String, dynamic>? oldValues;
  final Map<String, dynamic>? newValues;
  final String? ipAddress;
  final String? userAgent;
  final DateTime createdAt;

  AdminLog({
    required this.id,
    required this.adminId,
    required this.adminName,
    required this.action,
    required this.entityType,
    this.entityId,
    this.entityName,
    this.oldValues,
    this.newValues,
    this.ipAddress,
    this.userAgent,
    required this.createdAt,
  });

  /// Get action display name
  String get actionDisplay {
    switch (action.toLowerCase()) {
      case 'create':
        return 'Created';
      case 'update':
        return 'Updated';
      case 'delete':
        return 'Deleted';
      case 'approve':
        return 'Approved';
      case 'reject':
        return 'Rejected';
      case 'suspend':
        return 'Suspended';
      case 'activate':
        return 'Activated';
      case 'login':
        return 'Logged In';
      case 'logout':
        return 'Logged Out';
      default:
        return action;
    }
  }

  /// Get entity display name
  String get entityDisplay {
    switch (entityType.toLowerCase()) {
      case 'user':
        return 'User';
      case 'crop':
        return 'Crop';
      case 'order':
        return 'Order';
      case 'alert':
        return 'Alert';
      case 'event':
        return 'Event';
      case 'guidance':
        return 'Guidance';
      case 'market_price':
        return 'Market Price';
      default:
        return entityType;
    }
  }

  /// Get description of the action
  String get description {
    final entity = entityName ?? entityDisplay;
    return '$actionDisplay $entity';
  }

  factory AdminLog.fromJson(Map<String, dynamic> json) {
    return AdminLog(
      id: json['id'] ?? 0,
      adminId: json['admin_id'] ?? 0,
      adminName: json['admin_name'] ?? '',
      action: json['action'] ?? '',
      entityType: json['entity_type'] ?? '',
      entityId: json['entity_id'],
      entityName: json['entity_name'],
      oldValues: json['old_values'] != null
          ? Map<String, dynamic>.from(json['old_values'])
          : null,
      newValues: json['new_values'] != null
          ? Map<String, dynamic>.from(json['new_values'])
          : null,
      ipAddress: json['ip_address'],
      userAgent: json['user_agent'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'admin_id': adminId,
      'admin_name': adminName,
      'action': action,
      'entity_type': entityType,
      'entity_id': entityId,
      'entity_name': entityName,
      'old_values': oldValues,
      'new_values': newValues,
      'ip_address': ipAddress,
      'user_agent': userAgent,
      'created_at': createdAt.toIso8601String(),
    };
  }
}

/// Dashboard Statistics for Admin
class AdminDashboardStats {
  final int totalUsers;
  final int totalFarmers;
  final int totalBuyers;
  final int totalAdmins;
  final int totalCrops;
  final int pendingCrops;
  final int totalOrders;
  final int pendingOrders;
  final int completedOrders;
  final double totalRevenue;
  final int totalAlerts;
  final int pendingAlerts;
  final int totalEvents;
  final int upcomingEvents;
  final int totalGuidance;
  final List<DailyStat> dailyStats;
  final List<TopCrop> topCrops;
  final List<TopFarmer> topFarmers;

  AdminDashboardStats({
    required this.totalUsers,
    required this.totalFarmers,
    required this.totalBuyers,
    required this.totalAdmins,
    required this.totalCrops,
    required this.pendingCrops,
    required this.totalOrders,
    required this.pendingOrders,
    required this.completedOrders,
    required this.totalRevenue,
    required this.totalAlerts,
    required this.pendingAlerts,
    required this.totalEvents,
    required this.upcomingEvents,
    required this.totalGuidance,
    required this.dailyStats,
    required this.topCrops,
    required this.topFarmers,
  });

  factory AdminDashboardStats.fromJson(Map<String, dynamic> json) {
    return AdminDashboardStats(
      totalUsers: json['total_users'] ?? 0,
      totalFarmers: json['total_farmers'] ?? 0,
      totalBuyers: json['total_buyers'] ?? 0,
      totalAdmins: json['total_admins'] ?? 0,
      totalCrops: json['total_crops'] ?? 0,
      pendingCrops: json['pending_crops'] ?? 0,
      totalOrders: json['total_orders'] ?? 0,
      pendingOrders: json['pending_orders'] ?? 0,
      completedOrders: json['completed_orders'] ?? 0,
      totalRevenue: (json['total_revenue'] ?? 0).toDouble(),
      totalAlerts: json['total_alerts'] ?? 0,
      pendingAlerts: json['pending_alerts'] ?? 0,
      totalEvents: json['total_events'] ?? 0,
      upcomingEvents: json['upcoming_events'] ?? 0,
      totalGuidance: json['total_guidance'] ?? 0,
      dailyStats: json['daily_stats'] != null
          ? List<DailyStat>.from(
              json['daily_stats'].map((x) => DailyStat.fromJson(x)))
          : [],
      topCrops: json['top_crops'] != null
          ? List<TopCrop>.from(
              json['top_crops'].map((x) => TopCrop.fromJson(x)))
          : [],
      topFarmers: json['top_farmers'] != null
          ? List<TopFarmer>.from(
              json['top_farmers'].map((x) => TopFarmer.fromJson(x)))
          : [],
    );
  }
}

/// Daily Statistics
class DailyStat {
  final DateTime date;
  final int newUsers;
  final int newOrders;
  final double revenue;

  DailyStat({
    required this.date,
    required this.newUsers,
    required this.newOrders,
    required this.revenue,
  });

  factory DailyStat.fromJson(Map<String, dynamic> json) {
    return DailyStat(
      date: json['date'] != null
          ? DateTime.parse(json['date'])
          : DateTime.now(),
      newUsers: json['new_users'] ?? 0,
      newOrders: json['new_orders'] ?? 0,
      revenue: (json['revenue'] ?? 0).toDouble(),
    );
  }
}

/// Top Crop Statistics
class TopCrop {
  final String name;
  final int orderCount;
  final double totalRevenue;

  TopCrop({
    required this.name,
    required this.orderCount,
    required this.totalRevenue,
  });

  factory TopCrop.fromJson(Map<String, dynamic> json) {
    return TopCrop(
      name: json['name'] ?? '',
      orderCount: json['order_count'] ?? 0,
      totalRevenue: (json['total_revenue'] ?? 0).toDouble(),
    );
  }
}

/// Top Farmer Statistics
class TopFarmer {
  final int id;
  final String name;
  final int cropCount;
  final int orderCount;
  final double totalRevenue;

  TopFarmer({
    required this.id,
    required this.name,
    required this.cropCount,
    required this.orderCount,
    required this.totalRevenue,
  });

  factory TopFarmer.fromJson(Map<String, dynamic> json) {
    return TopFarmer(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      cropCount: json['crop_count'] ?? 0,
      orderCount: json['order_count'] ?? 0,
      totalRevenue: (json['total_revenue'] ?? 0).toDouble(),
    );
  }
}
