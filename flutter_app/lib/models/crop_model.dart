import '../constants/app_constants.dart';

/// Crop Model
class Crop {
  final int id;
  final String name;
  final String description;
  final String category;
  final double price;
  final String priceUnit;
  final double quantity;
  final String quantityUnit;
  final List<String> images;
  final String status;
  final int farmerId;
  final String farmerName;
  final String? farmerAvatar;
  final String farmerCounty;
  final String? farmerPhone;
  final bool isOrganic;
  final bool isNegotiable;
  final DateTime? harvestDate;
  final DateTime? expiryDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  Crop({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.price,
    required this.priceUnit,
    required this.quantity,
    required this.quantityUnit,
    required this.images,
    required this.status,
    required this.farmerId,
    required this.farmerName,
    this.farmerAvatar,
    required this.farmerCounty,
    this.farmerPhone,
    required this.isOrganic,
    required this.isNegotiable,
    this.harvestDate,
    this.expiryDate,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Get formatted price
  String get formattedPrice {
    return '${AppConstants.currencySymbol} ${price.toStringAsFixed(2)} / $priceUnit';
  }

  /// Get formatted quantity
  String get formattedQuantity {
    return '$quantity $quantityUnit';
  }

  /// Check if crop is available
  bool get isAvailable => status == AppConstants.cropApproved;

  /// Check if crop is pending approval
  bool get isPending => status == AppConstants.cropPending;

  /// Get primary image
  String? get primaryImage => images.isNotEmpty ? images.first : null;

  factory Crop.fromJson(Map<String, dynamic> json) {
    return Crop(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      priceUnit: json['price_unit'] ?? AppConstants.unitKg,
      quantity: (json['quantity'] ?? 0).toDouble(),
      quantityUnit: json['quantity_unit'] ?? AppConstants.unitKg,
      images: json['images'] != null
          ? List<String>.from(json['images'])
          : [],
      status: json['status'] ?? AppConstants.cropPending,
      farmerId: json['farmer_id'] ?? 0,
      farmerName: json['farmer_name'] ?? '',
      farmerAvatar: json['farmer_avatar'],
      farmerCounty: json['farmer_county'] ?? '',
      farmerPhone: json['farmer_phone'],
      isOrganic: json['is_organic'] ?? false,
      isNegotiable: json['is_negotiable'] ?? false,
      harvestDate: json['harvest_date'] != null
          ? DateTime.parse(json['harvest_date'])
          : null,
      expiryDate: json['expiry_date'] != null
          ? DateTime.parse(json['expiry_date'])
          : null,
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
      'name': name,
      'description': description,
      'category': category,
      'price': price,
      'price_unit': priceUnit,
      'quantity': quantity,
      'quantity_unit': quantityUnit,
      'images': images,
      'status': status,
      'farmer_id': farmerId,
      'farmer_name': farmerName,
      'farmer_avatar': farmerAvatar,
      'farmer_county': farmerCounty,
      'farmer_phone': farmerPhone,
      'is_organic': isOrganic,
      'is_negotiable': isNegotiable,
      'harvest_date': harvestDate?.toIso8601String(),
      'expiry_date': expiryDate?.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Crop copyWith({
    int? id,
    String? name,
    String? description,
    String? category,
    double? price,
    String? priceUnit,
    double? quantity,
    String? quantityUnit,
    List<String>? images,
    String? status,
    int? farmerId,
    String? farmerName,
    String? farmerAvatar,
    String? farmerCounty,
    String? farmerPhone,
    bool? isOrganic,
    bool? isNegotiable,
    DateTime? harvestDate,
    DateTime? expiryDate,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Crop(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      price: price ?? this.price,
      priceUnit: priceUnit ?? this.priceUnit,
      quantity: quantity ?? this.quantity,
      quantityUnit: quantityUnit ?? this.quantityUnit,
      images: images ?? this.images,
      status: status ?? this.status,
      farmerId: farmerId ?? this.farmerId,
      farmerName: farmerName ?? this.farmerName,
      farmerAvatar: farmerAvatar ?? this.farmerAvatar,
      farmerCounty: farmerCounty ?? this.farmerCounty,
      farmerPhone: farmerPhone ?? this.farmerPhone,
      isOrganic: isOrganic ?? this.isOrganic,
      isNegotiable: isNegotiable ?? this.isNegotiable,
      harvestDate: harvestDate ?? this.harvestDate,
      expiryDate: expiryDate ?? this.expiryDate,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Crop Category Model
class CropCategory {
  final int id;
  final String name;
  final String? description;
  final String? icon;
  final int cropCount;

  CropCategory({
    required this.id,
    required this.name,
    this.description,
    this.icon,
    this.cropCount = 0,
  });

  factory CropCategory.fromJson(Map<String, dynamic> json) {
    return CropCategory(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'],
      icon: json['icon'],
      cropCount: json['crop_count'] ?? 0,
    );
  }
}

/// Crop Create/Update Data
class CropData {
  final String name;
  final String description;
  final String category;
  final double price;
  final String priceUnit;
  final double quantity;
  final String quantityUnit;
  final List<String> images;
  final bool isOrganic;
  final bool isNegotiable;
  final DateTime? harvestDate;
  final DateTime? expiryDate;

  CropData({
    required this.name,
    required this.description,
    required this.category,
    required this.price,
    required this.priceUnit,
    required this.quantity,
    required this.quantityUnit,
    required this.images,
    required this.isOrganic,
    required this.isNegotiable,
    this.harvestDate,
    this.expiryDate,
  });

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'category': category,
      'price': price,
      'price_unit': priceUnit,
      'quantity': quantity,
      'quantity_unit': quantityUnit,
      'images': images,
      'is_organic': isOrganic,
      'is_negotiable': isNegotiable,
      'harvest_date': harvestDate?.toIso8601String(),
      'expiry_date': expiryDate?.toIso8601String(),
    };
  }
}

/// Crop Filter Options
class CropFilter {
  String? category;
  String? county;
  double? minPrice;
  double? maxPrice;
  bool? isOrganic;
  String? searchQuery;
  String? sortBy;

  CropFilter({
    this.category,
    this.county,
    this.minPrice,
    this.maxPrice,
    this.isOrganic,
    this.searchQuery,
    this.sortBy,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (category != null) data['category'] = category;
    if (county != null) data['county'] = county;
    if (minPrice != null) data['min_price'] = minPrice;
    if (maxPrice != null) data['max_price'] = maxPrice;
    if (isOrganic != null) data['is_organic'] = isOrganic;
    if (searchQuery != null) data['search'] = searchQuery;
    if (sortBy != null) data['sort_by'] = sortBy;
    return data;
  }
}
