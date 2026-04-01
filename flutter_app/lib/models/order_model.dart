import '../constants/app_constants.dart';

/// Order Model
class Order {
  final int id;
  final int cropId;
  final String cropName;
  final String? cropImage;
  final int buyerId;
  final String buyerName;
  final String? buyerPhone;
  final int farmerId;
  final String farmerName;
  final String? farmerPhone;
  final double quantity;
  final String quantityUnit;
  final double unitPrice;
  final double totalPrice;
  final String status;
  final String? notes;
  final DateTime? deliveryDate;
  final String? deliveryAddress;
  final DateTime createdAt;
  final DateTime updatedAt;

  Order({
    required this.id,
    required this.cropId,
    required this.cropName,
    this.cropImage,
    required this.buyerId,
    required this.buyerName,
    this.buyerPhone,
    required this.farmerId,
    required this.farmerName,
    this.farmerPhone,
    required this.quantity,
    required this.quantityUnit,
    required this.unitPrice,
    required this.totalPrice,
    required this.status,
    this.notes,
    this.deliveryDate,
    this.deliveryAddress,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Get formatted total price
  String get formattedTotalPrice {
    return '${AppConstants.currencySymbol} ${totalPrice.toStringAsFixed(2)}';
  }

  /// Get formatted unit price
  String get formattedUnitPrice {
    return '${AppConstants.currencySymbol} ${unitPrice.toStringAsFixed(2)} / $quantityUnit';
  }

  /// Get formatted quantity
  String get formattedQuantity {
    return '$quantity $quantityUnit';
  }

  /// Check if order is pending
  bool get isPending => status == AppConstants.orderPending;

  /// Check if order is confirmed
  bool get isConfirmed => status == AppConstants.orderConfirmed;

  /// Check if order is processing
  bool get isProcessing => status == AppConstants.orderProcessing;

  /// Check if order is shipped
  bool get isShipped => status == AppConstants.orderShipped;

  /// Check if order is delivered
  bool get isDelivered => status == AppConstants.orderDelivered;

  /// Check if order is cancelled
  bool get isCancelled => status == AppConstants.orderCancelled;

  /// Get status color
  String get statusDisplay {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] ?? 0,
      cropId: json['crop_id'] ?? 0,
      cropName: json['crop_name'] ?? '',
      cropImage: json['crop_image'],
      buyerId: json['buyer_id'] ?? 0,
      buyerName: json['buyer_name'] ?? '',
      buyerPhone: json['buyer_phone'],
      farmerId: json['farmer_id'] ?? 0,
      farmerName: json['farmer_name'] ?? '',
      farmerPhone: json['farmer_phone'],
      quantity: (json['quantity'] ?? 0).toDouble(),
      quantityUnit: json['quantity_unit'] ?? AppConstants.unitKg,
      unitPrice: (json['unit_price'] ?? 0).toDouble(),
      totalPrice: (json['total_price'] ?? 0).toDouble(),
      status: json['status'] ?? AppConstants.orderPending,
      notes: json['notes'],
      deliveryDate: json['delivery_date'] != null
          ? DateTime.parse(json['delivery_date'])
          : null,
      deliveryAddress: json['delivery_address'],
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
      'crop_id': cropId,
      'crop_name': cropName,
      'crop_image': cropImage,
      'buyer_id': buyerId,
      'buyer_name': buyerName,
      'buyer_phone': buyerPhone,
      'farmer_id': farmerId,
      'farmer_name': farmerName,
      'farmer_phone': farmerPhone,
      'quantity': quantity,
      'quantity_unit': quantityUnit,
      'unit_price': unitPrice,
      'total_price': totalPrice,
      'status': status,
      'notes': notes,
      'delivery_date': deliveryDate?.toIso8601String(),
      'delivery_address': deliveryAddress,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Order copyWith({
    int? id,
    int? cropId,
    String? cropName,
    String? cropImage,
    int? buyerId,
    String? buyerName,
    String? buyerPhone,
    int? farmerId,
    String? farmerName,
    String? farmerPhone,
    double? quantity,
    String? quantityUnit,
    double? unitPrice,
    double? totalPrice,
    String? status,
    String? notes,
    DateTime? deliveryDate,
    String? deliveryAddress,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Order(
      id: id ?? this.id,
      cropId: cropId ?? this.cropId,
      cropName: cropName ?? this.cropName,
      cropImage: cropImage ?? this.cropImage,
      buyerId: buyerId ?? this.buyerId,
      buyerName: buyerName ?? this.buyerName,
      buyerPhone: buyerPhone ?? this.buyerPhone,
      farmerId: farmerId ?? this.farmerId,
      farmerName: farmerName ?? this.farmerName,
      farmerPhone: farmerPhone ?? this.farmerPhone,
      quantity: quantity ?? this.quantity,
      quantityUnit: quantityUnit ?? this.quantityUnit,
      unitPrice: unitPrice ?? this.unitPrice,
      totalPrice: totalPrice ?? this.totalPrice,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      deliveryDate: deliveryDate ?? this.deliveryDate,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Order Create Data
class OrderCreateData {
  final int cropId;
  final double quantity;
  final String? notes;
  final DateTime? deliveryDate;
  final String? deliveryAddress;

  OrderCreateData({
    required this.cropId,
    required this.quantity,
    this.notes,
    this.deliveryDate,
    this.deliveryAddress,
  });

  Map<String, dynamic> toJson() {
    return {
      'crop_id': cropId,
      'quantity': quantity,
      'notes': notes,
      'delivery_date': deliveryDate?.toIso8601String(),
      'delivery_address': deliveryAddress,
    };
  }
}

/// Order Statistics
class OrderStats {
  final int totalOrders;
  final int pendingOrders;
  final int completedOrders;
  final int cancelledOrders;
  final double totalRevenue;
  final double pendingRevenue;

  OrderStats({
    required this.totalOrders,
    required this.pendingOrders,
    required this.completedOrders,
    required this.cancelledOrders,
    required this.totalRevenue,
    required this.pendingRevenue,
  });

  factory OrderStats.fromJson(Map<String, dynamic> json) {
    return OrderStats(
      totalOrders: json['total_orders'] ?? 0,
      pendingOrders: json['pending_orders'] ?? 0,
      completedOrders: json['completed_orders'] ?? 0,
      cancelledOrders: json['cancelled_orders'] ?? 0,
      totalRevenue: (json['total_revenue'] ?? 0).toDouble(),
      pendingRevenue: (json['pending_revenue'] ?? 0).toDouble(),
    );
  }
}
