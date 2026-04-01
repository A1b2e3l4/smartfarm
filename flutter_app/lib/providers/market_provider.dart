import 'package:flutter/foundation.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Market Provider - Manages market prices and guidance
class MarketProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  // State
  List<MarketPrice> _marketPrices = [];
  List<MarketTrend> _marketTrends = [];
  List<Guidance> _guidance = [];
  List<Guidance> _featuredGuidance = [];
  MarketPrice? _selectedPrice;
  Guidance? _selectedGuidance;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<MarketPrice> get marketPrices => _marketPrices;
  List<MarketTrend> get marketTrends => _marketTrends;
  List<Guidance> get guidance => _guidance;
  List<Guidance> get featuredGuidance => _featuredGuidance;
  List<Guidance> get cropGuidance =>
      _guidance.where((g) => g.isCropGuidance).toList();
  List<Guidance> get livestockGuidance =>
      _guidance.where((g) => g.isLivestockGuidance).toList();
  MarketPrice? get selectedPrice => _selectedPrice;
  Guidance? get selectedGuidance => _selectedGuidance;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // ==================== Market Price Operations ====================

  /// Fetch market prices
  Future<void> fetchMarketPrices({String? county, String? category}) async {
    _setLoading(true);
    _clearError();

    try {
      final queryParams = <String, dynamic>{};
      if (county != null) queryParams['county'] = county;
      if (category != null) queryParams['category'] = category;

      final response = await _apiService.getPaginated<MarketPrice>(
        AppConstants.marketPrices,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
        fromJson: (json) => MarketPrice.fromJson(json),
      );

      if (response != null) {
        _marketPrices = response.data;
      }
    } catch (e) {
      _setError('Failed to load market prices. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch market trends
  Future<void> fetchMarketTrends(String cropName) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        '${AppConstants.marketTrends}/$cropName',
      );

      if (response.success && response.data != null) {
        final trend = MarketTrend.fromJson(response.data!);
        _marketTrends.add(trend);
      }
    } catch (e) {
      _setError('Failed to load market trends. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Update market price (admin)
  Future<bool> updateMarketPrice(MarketPriceUpdateData priceData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.marketPriceUpdate,
        data: priceData.toJson(),
      );

      if (response.success && response.data != null) {
        final updatedPrice = MarketPrice.fromJson(response.data!);

        // Update in list
        final index = _marketPrices.indexWhere((p) =>
            p.cropName == updatedPrice.cropName &&
            p.county == updatedPrice.county);

        if (index != -1) {
          _marketPrices[index] = updatedPrice;
        } else {
          _marketPrices.insert(0, updatedPrice);
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to update market price. Please try again.');
      return false;
    }
  }

  /// Get price for specific crop
  MarketPrice? getPriceForCrop(String cropName, {String? county}) {
    return _marketPrices.firstWhere(
      (p) =>
          p.cropName.toLowerCase() == cropName.toLowerCase() &&
          (county == null || p.county == county),
      orElse: () => null as MarketPrice,
    );
  }

  // ==================== Guidance Operations ====================

  /// Fetch all guidance
  Future<void> fetchGuidance({String? type, String? category}) async {
    _setLoading(true);
    _clearError();

    try {
      final queryParams = <String, dynamic>{};
      if (type != null) queryParams['type'] = type;
      if (category != null) queryParams['category'] = category;

      final response = await _apiService.getPaginated<Guidance>(
        AppConstants.guidance,
        queryParameters: queryParams.isNotEmpty ? queryParams : null,
        fromJson: (json) => Guidance.fromJson(json),
      );

      if (response != null) {
        _guidance = response.data;
      }
    } catch (e) {
      _setError('Failed to load guidance. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch featured guidance
  Future<void> fetchFeaturedGuidance() async {
    try {
      final response = await _apiService.getPaginated<Guidance>(
        '${AppConstants.guidance}/featured',
        fromJson: (json) => Guidance.fromJson(json),
      );

      if (response != null) {
        _featuredGuidance = response.data;
        notifyListeners();
      }
    } catch (e) {
      // Silently fail
    }
  }

  /// Fetch guidance details
  Future<bool> fetchGuidanceDetails(int guidanceId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        '${AppConstants.guidance}/$guidanceId',
      );

      if (response.success && response.data != null) {
        _selectedGuidance = Guidance.fromJson(response.data!);
        _setLoading(false);
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to load guidance details. Please try again.');
      return false;
    }
  }

  /// Create guidance (admin)
  Future<bool> createGuidance(GuidanceCreateData guidanceData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.guidanceCreate,
        data: guidanceData.toJson(),
      );

      if (response.success && response.data != null) {
        final newGuidance = Guidance.fromJson(response.data!);
        _guidance.insert(0, newGuidance);

        if (newGuidance.isFeatured) {
          _featuredGuidance.insert(0, newGuidance);
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to create guidance. Please try again.');
      return false;
    }
  }

  /// Update guidance (admin)
  Future<bool> updateGuidance(
    int guidanceId,
    GuidanceCreateData guidanceData,
  ) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.put<Map<String, dynamic>>(
        '${AppConstants.guidanceUpdate}/$guidanceId',
        data: guidanceData.toJson(),
      );

      if (response.success && response.data != null) {
        final updatedGuidance = Guidance.fromJson(response.data!);

        _updateGuidanceInList(_guidance, updatedGuidance);
        _updateGuidanceInList(_featuredGuidance, updatedGuidance);

        if (_selectedGuidance?.id == guidanceId) {
          _selectedGuidance = updatedGuidance;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to update guidance. Please try again.');
      return false;
    }
  }

  /// Delete guidance (admin)
  Future<bool> deleteGuidance(int guidanceId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.delete(
        '${AppConstants.guidanceDelete}/$guidanceId',
      );

      if (response.success) {
        _guidance.removeWhere((g) => g.id == guidanceId);
        _featuredGuidance.removeWhere((g) => g.id == guidanceId);

        if (_selectedGuidance?.id == guidanceId) {
          _selectedGuidance = null;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to delete guidance. Please try again.');
      return false;
    }
  }

  /// Increment guidance view count
  Future<void> incrementViewCount(int guidanceId) async {
    try {
      await _apiService.post(
        '${AppConstants.guidance}/$guidanceId/view',
      );
    } catch (e) {
      // Silently fail
    }
  }

  // ==================== Private Methods ====================

  void _updateGuidanceInList(List<Guidance> list, Guidance updatedGuidance) {
    final index = list.indexWhere((g) => g.id == updatedGuidance.id);
    if (index != -1) {
      list[index] = updatedGuidance;
    }
  }

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
    _marketPrices = [];
    _marketTrends = [];
    _guidance = [];
    _featuredGuidance = [];
    _selectedPrice = null;
    _selectedGuidance = null;
    _isLoading = false;
    _error = null;
    notifyListeners();
  }
}
