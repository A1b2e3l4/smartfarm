import 'package:flutter/foundation.dart';
import '../constants/app_constants.dart';
import '../models/models.dart';
import '../services/services.dart';

/// Alert Provider - Manages alert and event state
class AlertProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();

  // State
  List<Alert> _alerts = [];
  List<Alert> _pendingAlerts = [];
  List<Event> _events = [];
  List<Event> _upcomingEvents = [];
  Alert? _selectedAlert;
  Event? _selectedEvent;
  int _unreadCount = 0;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Alert> get alerts => _alerts;
  List<Alert> get pendingAlerts => _pendingAlerts;
  List<Event> get events => _events;
  List<Event> get upcomingEvents => _upcomingEvents;
  Alert? get selectedAlert => _selectedAlert;
  Event? get selectedEvent => _selectedEvent;
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // ==================== Alert Operations ====================

  /// Fetch all alerts
  Future<void> fetchAlerts() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<Alert>(
        AppConstants.alerts,
        fromJson: (json) => Alert.fromJson(json),
      );

      if (response != null) {
        _alerts = response.data;
        _calculateUnreadCount();
      }
    } catch (e) {
      _setError('Failed to load alerts. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch pending alerts (admin)
  Future<void> fetchPendingAlerts() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<Alert>(
        '${AppConstants.alerts}/pending',
        fromJson: (json) => Alert.fromJson(json),
      );

      if (response != null) {
        _pendingAlerts = response.data;
      }
    } catch (e) {
      _setError('Failed to load pending alerts. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Create alert
  Future<bool> createAlert(AlertCreateData alertData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.alertCreate,
        data: alertData.toJson(),
      );

      if (response.success && response.data != null) {
        final newAlert = Alert.fromJson(response.data!);
        _alerts.insert(0, newAlert);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to create alert. Please try again.');
      return false;
    }
  }

  /// Approve alert (admin)
  Future<bool> approveAlert(int alertId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        '${AppConstants.alertApprove}/$alertId',
      );

      if (response.success && response.data != null) {
        final updatedAlert = Alert.fromJson(response.data!);
        _updateAlertInList(_pendingAlerts, updatedAlert);
        _pendingAlerts.removeWhere((a) => a.id == alertId);
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to approve alert. Please try again.');
      return false;
    }
  }

  /// Mark alert as read
  Future<bool> markAsRead(int alertId) async {
    try {
      final response = await _apiService.post(
        '${AppConstants.alerts}/$alertId/read',
      );

      if (response.success) {
        final index = _alerts.indexWhere((a) => a.id == alertId);
        if (index != -1) {
          _alerts[index] = _alerts[index].copyWith(isRead: true);
          _calculateUnreadCount();
          notifyListeners();
        }
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Mark all alerts as read
  Future<bool> markAllAsRead() async {
    try {
      final response = await _apiService.post(
        '${AppConstants.alerts}/read-all',
      );

      if (response.success) {
        _alerts = _alerts.map((a) => a.copyWith(isRead: true)).toList();
        _unreadCount = 0;
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Delete alert
  Future<bool> deleteAlert(int alertId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.delete(
        '${AppConstants.alertDelete}/$alertId',
      );

      if (response.success) {
        _alerts.removeWhere((a) => a.id == alertId);
        _pendingAlerts.removeWhere((a) => a.id == alertId);
        _calculateUnreadCount();
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to delete alert. Please try again.');
      return false;
    }
  }

  // ==================== Event Operations ====================

  /// Fetch all events
  Future<void> fetchEvents() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<Event>(
        AppConstants.events,
        fromJson: (json) => Event.fromJson(json),
      );

      if (response != null) {
        _events = response.data;
      }
    } catch (e) {
      _setError('Failed to load events. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch upcoming events
  Future<void> fetchUpcomingEvents() async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.getPaginated<Event>(
        AppConstants.upcomingEvents,
        fromJson: (json) => Event.fromJson(json),
      );

      if (response != null) {
        _upcomingEvents = response.data;
      }
    } catch (e) {
      _setError('Failed to load upcoming events. Please try again.');
    } finally {
      _setLoading(false);
    }
  }

  /// Create event
  Future<bool> createEvent(EventCreateData eventData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.post<Map<String, dynamic>>(
        AppConstants.eventCreate,
        data: eventData.toJson(),
      );

      if (response.success && response.data != null) {
        final newEvent = Event.fromJson(response.data!);
        _events.insert(0, newEvent);
        if (newEvent.isUpcoming) {
          _upcomingEvents.insert(0, newEvent);
        }
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to create event. Please try again.');
      return false;
    }
  }

  /// Update event
  Future<bool> updateEvent(int eventId, EventCreateData eventData) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.put<Map<String, dynamic>>(
        '${AppConstants.eventUpdate}/$eventId',
        data: eventData.toJson(),
      );

      if (response.success && response.data != null) {
        final updatedEvent = Event.fromJson(response.data!);
        _updateEventInList(_events, updatedEvent);
        _updateEventInList(_upcomingEvents, updatedEvent);

        if (_selectedEvent?.id == eventId) {
          _selectedEvent = updatedEvent;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to update event. Please try again.');
      return false;
    }
  }

  /// Delete event
  Future<bool> deleteEvent(int eventId) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _apiService.delete(
        '${AppConstants.eventDelete}/$eventId',
      );

      if (response.success) {
        _events.removeWhere((e) => e.id == eventId);
        _upcomingEvents.removeWhere((e) => e.id == eventId);

        if (_selectedEvent?.id == eventId) {
          _selectedEvent = null;
        }

        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      _setError('Failed to delete event. Please try again.');
      return false;
    }
  }

  /// Register for event
  Future<bool> registerForEvent(int eventId) async {
    try {
      final response = await _apiService.post(
        '${AppConstants.events}/$eventId/register',
      );

      if (response.success) {
        // Update event registration status
        final eventIndex = _events.indexWhere((e) => e.id == eventId);
        if (eventIndex != -1) {
          _events[eventIndex] = _events[eventIndex].copyWith(
            isRegistered: true,
            currentAttendees: _events[eventIndex].currentAttendees + 1,
          );
        }

        final upcomingIndex = _upcomingEvents.indexWhere((e) => e.id == eventId);
        if (upcomingIndex != -1) {
          _upcomingEvents[upcomingIndex] = _upcomingEvents[upcomingIndex].copyWith(
            isRegistered: true,
            currentAttendees: _upcomingEvents[upcomingIndex].currentAttendees + 1,
          );
        }

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Unregister from event
  Future<bool> unregisterFromEvent(int eventId) async {
    try {
      final response = await _apiService.post(
        '${AppConstants.events}/$eventId/unregister',
      );

      if (response.success) {
        // Update event registration status
        final eventIndex = _events.indexWhere((e) => e.id == eventId);
        if (eventIndex != -1) {
          _events[eventIndex] = _events[eventIndex].copyWith(
            isRegistered: false,
            currentAttendees: _events[eventIndex].currentAttendees - 1,
          );
        }

        final upcomingIndex = _upcomingEvents.indexWhere((e) => e.id == eventId);
        if (upcomingIndex != -1) {
          _upcomingEvents[upcomingIndex] = _upcomingEvents[upcomingIndex].copyWith(
            isRegistered: false,
            currentAttendees: _upcomingEvents[upcomingIndex].currentAttendees - 1,
          );
        }

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // ==================== Private Methods ====================

  void _updateAlertInList(List<Alert> list, Alert updatedAlert) {
    final index = list.indexWhere((a) => a.id == updatedAlert.id);
    if (index != -1) {
      list[index] = updatedAlert;
    }
  }

  void _updateEventInList(List<Event> list, Event updatedEvent) {
    final index = list.indexWhere((e) => e.id == updatedEvent.id);
    if (index != -1) {
      list[index] = updatedEvent;
    }
  }

  void _calculateUnreadCount() {
    _unreadCount = _alerts.where((a) => !a.isRead).length;
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
    _alerts = [];
    _pendingAlerts = [];
    _events = [];
    _upcomingEvents = [];
    _selectedAlert = null;
    _selectedEvent = null;
    _unreadCount = 0;
    _isLoading = false;
    _error = null;
    notifyListeners();
  }
}
