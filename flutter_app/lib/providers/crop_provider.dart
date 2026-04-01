import 'package:flutter/foundation.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Crop Provider - Manages crop-related state
class CropProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  // State
  List<Crop> _crops = [];
  List<Crop> _myCrops = [];
  List<Crop> _pendingCrops = [];
  List<CropCategory> _categories = [];
  Crop? _selectedCrop;
  bool _isLoading = false;
  bool _isLoadingMore = false;
  String? _error;

  // Pagination
  int _currentPage = 1;
  int _lastPage = 1;
  int _total = 0;

  // Getters
  List<Crop> get crops => _crops;
  List<Crop> get myCrops => _myCrops;
  List<Crop> get pendingCrops => _pendingCrops;
  List<CropCategory> get categories => _categories;
  Crop? get selectedCrop => _selectedCrop;
  bool get isLoading => _isLoading;
  bool get isLoadingMore => _isLoadingMore;
  String? get error => _error;
  bool get hasMoreData => _currentPage < _lastPage;
  int get total => _total;

  // ==================== Crop Operations ====================

  /// Fetch all crops with pagination
  Future<void> fetchCrops({
    int page = 1,
    int perPage = 20,
    CropFilter? filter,
    bool refresh = false,
  }) async {
    if (refresh) {
      _crops = [];
      _currentPage = 1;
    }

    if (page == 1) {
      _setLoading(true);
    } else {
      _isLoadingMore = true;
      notifyListeners();
    }
    _clearError();

    try {
      final queryParams = {
        'page': page,
        'per_page': perPage,
        ...?filter?.toJson(),
      };

      final response = await _apiService.getPaginated<Crop>(
        AppConstants.crops,
        queryParameters: queryParams,
        fromJson: (json) => Crop.fromJson(json),
      );

      if (response != null) {
        if (page == 1) {
          _crops = response.data;
        } else {
          _crops.addAll(response.data);
        }
        _currentPage = response.currentPage;
        _lastPage = response.lastPage;
        _total = response.total;
      }
    } catch (e) {
      _setError('Failed to load crops. Please try again.');
    } finally {
      _setLoading(false);
      _isLoadingMore = false;
      notifyListeners();
    }
  }

  /// Load more crops
  Future<void> loadMoreCrops({CropFilter? filter}) async {
    if (_isLoadingMore || !hasMoreData) return;
    await fetchCrops(
      page: _currentPage + 1,
      filter: filter,
    );
  }

  /// Fetch crop details
  Future<bool> fetchCropDetails(int cropId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        '${AppConstants.cropDetails}/$cropId',
      );

      if (response.success && response.data != null) {
        _selectedCrop = Crop.fromJson(response.data!);
        _setLoading(false);
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to load crop details. Please try again.');
      return false;
    }
  }

  /// Fetch my crops (for farmers)
  Future<void> fetchMyCrops() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<Crop>(
        AppConstants.myCrops,
        fromJson: (json) => Crop.fromJson(json),
      );

      if (response != null) {
        _myCrops = response.data;
      }
    } catch (e) {
      _setError('Failed to load your crops. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch pending crops (for admin)
  Future<void> fetchPendingCrops() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<Crop>(
        '${AppConstants.crops}/pending',
        fromJson: (json) => Crop.fromJson(json),
      );

      if (response != null) {
        _pendingCrops = response.data;
      }
    } catch (e) {
      _setError('Failed to load pending crops. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Create new crop
  Future<bool> createCrop(CropData cropData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.cropCreate,
        data: cropData.toJson(),
      );

      if (response.success && response.data != null) {
        final newCrop = Crop.fromJson(response.data!);
        _myCrops.insert(0, newCrop);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        if (response.hasErrors) {
          _setError(response.errorMessages.join('\n'));
        }
        return false;
      }
    } catch (e) {
      _setError('Failed to create crop. Please try again.');
      return false;
    }
  }

  /// Update crop
  Future<bool> updateCrop(int cropId, CropData cropData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.put<Map<String, dynamic>>(
        '${AppConstants.cropUpdate}/$cropId',
        data: cropData.toJson(),
      );

      if (response.success && response.data != null) {
        final updatedCrop = Crop.fromJson(response.data!);

        // Update in lists
        _updateCropInList(_crops, updatedCrop);
        _updateCropInList(_myCrops, updatedCrop);
        _updateCropInList(_pendingCrops, updatedCrop);

        if (_selectedCrop?.id == cropId) {
          _selectedCrop = updatedCrop;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to update crop. Please try again.');
      return false;
    }
  }

  /// Delete crop
  Future<bool> deleteCrop(int cropId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.delete(
        '${AppConstants.cropDelete}/$cropId',
      );

      if (response.success) {
        _crops.removeWhere((c) => c.id == cropId);
        _myCrops.removeWhere((c) => c.id == cropId);
        _pendingCrops.removeWhere((c) => c.id == cropId);

        if (_selectedCrop?.id == cropId) {
          _selectedCrop = null;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to delete crop. Please try again.');
      return false;
    }
  }

  /// Approve crop (admin only)
  Future<bool> approveCrop(int cropId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '${AppConstants.cropApprove}/$cropId',
      );

      if (response.success && response.data != null) {
        final updatedCrop = Crop.fromJson(response.data!);
        _updateCropInList(_pendingCrops, updatedCrop);
        _pendingCrops.removeWhere((c) => c.id == cropId);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to approve crop. Please try again.');
      return false;
    }
  }

  /// Search crops
  Future<void> searchCrops(String query) async {
    await fetchCrops(
      filter: CropFilter(searchQuery: query),
      refresh: true,
    );
  }

  /// Fetch crop categories
  Future<void> fetchCategories() async {
    try {
      final response = await _apiService.get<List<dynamic>>(
        '${AppConstants.crops}/categories',
      );

      if (response.success && response.data != null) {
        _categories = response.data!
            .map((json) => CropCategory.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      // Silently fail
    }
  }

  /// Clear selected crop
  void clearSelectedCrop() {
    _selectedCrop = null;
    notifyListeners();
  }

  /// Refresh crops
  Future<void> refreshCrops() async {
    await fetchCrops(refresh: true);
  }

  // ==================== Private Methods ====================

  void _updateCropInList(List<Crop> list, Crop updatedCrop) {
    final index = list.indexWhere((c) => c.id == updatedCrop.id);
    if (index != -1) {
      list[index] = updatedCrop;
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
    _crops = [];
    _myCrops = [];
    _pendingCrops = [];
    _categories = [];
    _selectedCrop = null;
    _isLoading = false;
    _isLoadingMore = false;
    _error = null;
    _currentPage = 1;
    _lastPage = 1;
    _total = 0;
    notifyListeners();
  }
}
