import '../constants/app_constants.dart';

/// Market Price Model
class MarketPrice {
  final int id;
  final String cropName;
  final String category;
  final double minPrice;
  final double maxPrice;
  final double avgPrice;
  final String unit;
  final String? county;
  final String? market;
  final double? priceChange;
  final double? priceChangePercent;
  final DateTime priceDate;
  final int? updatedBy;
  final String? updatedByName;
  final DateTime createdAt;
  final DateTime updatedAt;

  MarketPrice({
    required this.id,
    required this.cropName,
    required this.category,
    required this.minPrice,
    required this.maxPrice,
    required this.avgPrice,
    required this.unit,
    this.county,
    this.market,
    this.priceChange,
    this.priceChangePercent,
    required this.priceDate,
    this.updatedBy,
    this.updatedByName,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Get formatted average price
  String get formattedAvgPrice {
    return '${AppConstants.currencySymbol} ${avgPrice.toStringAsFixed(2)}';
  }

  /// Get formatted price range
  String get formattedPriceRange {
    return '${AppConstants.currencySymbol} ${minPrice.toStringAsFixed(2)} - ${AppConstants.currencySymbol} ${maxPrice.toStringAsFixed(2)}';
  }

  /// Check if price increased
  bool get isPriceUp => priceChange != null && priceChange! > 0;

  /// Check if price decreased
  bool get isPriceDown => priceChange != null && priceChange! < 0;

  /// Check if price is stable
  bool get isPriceStable => priceChange == null || priceChange == 0;

  factory MarketPrice.fromJson(Map<String, dynamic> json) {
    return MarketPrice(
      id: json['id'] ?? 0,
      cropName: json['crop_name'] ?? '',
      category: json['category'] ?? '',
      minPrice: (json['min_price'] ?? 0).toDouble(),
      maxPrice: (json['max_price'] ?? 0).toDouble(),
      avgPrice: (json['avg_price'] ?? 0).toDouble(),
      unit: json['unit'] ?? AppConstants.unitKg,
      county: json['county'],
      market: json['market'],
      priceChange: json['price_change'] != null
          ? (json['price_change']).toDouble()
          : null,
      priceChangePercent: json['price_change_percent'] != null
          ? (json['price_change_percent']).toDouble()
          : null,
      priceDate: json['price_date'] != null
          ? DateTime.parse(json['price_date'])
          : DateTime.now(),
      updatedBy: json['updated_by'],
      updatedByName: json['updated_by_name'],
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
      'crop_name': cropName,
      'category': category,
      'min_price': minPrice,
      'max_price': maxPrice,
      'avg_price': avgPrice,
      'unit': unit,
      'county': county,
      'market': market,
      'price_change': priceChange,
      'price_change_percent': priceChangePercent,
      'price_date': priceDate.toIso8601String(),
      'updated_by': updatedBy,
      'updated_by_name': updatedByName,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

/// Market Price Update Data
class MarketPriceUpdateData {
  final String cropName;
  final String category;
  final double minPrice;
  final double maxPrice;
  final String unit;
  final String? county;
  final String? market;
  final DateTime? priceDate;

  MarketPriceUpdateData({
    required this.cropName,
    required this.category,
    required this.minPrice,
    required this.maxPrice,
    required this.unit,
    this.county,
    this.market,
    this.priceDate,
  });

  Map<String, dynamic> toJson() {
    return {
      'crop_name': cropName,
      'category': category,
      'min_price': minPrice,
      'max_price': maxPrice,
      'unit': unit,
      'county': county,
      'market': market,
      'price_date': priceDate?.toIso8601String(),
    };
  }
}

/// Market Trend Data
class MarketTrend {
  final String cropName;
  final List<TrendData> data;

  MarketTrend({
    required this.cropName,
    required this.data,
  });

  factory MarketTrend.fromJson(Map<String, dynamic> json) {
    return MarketTrend(
      cropName: json['crop_name'] ?? '',
      data: json['data'] != null
          ? List<TrendData>.from(
              json['data'].map((x) => TrendData.fromJson(x)))
          : [],
    );
  }
}

/// Trend Data Point
class TrendData {
  final DateTime date;
  final double price;

  TrendData({
    required this.date,
    required this.price,
  });

  factory TrendData.fromJson(Map<String, dynamic> json) {
    return TrendData(
      date: json['date'] != null
          ? DateTime.parse(json['date'])
          : DateTime.now(),
      price: (json['price'] ?? 0).toDouble(),
    );
  }
}
