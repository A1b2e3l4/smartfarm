/// Event Model
class Event {
  final int id;
  final String title;
  final String description;
  final String? location;
  final DateTime startDate;
  final DateTime endDate;
  final String? image;
  final int? createdBy;
  final String? createdByName;
  final bool isPublic;
  final int? maxAttendees;
  final int currentAttendees;
  final bool isRegistered;
  final DateTime createdAt;
  final DateTime updatedAt;

  Event({
    required this.id,
    required this.title,
    required this.description,
    this.location,
    required this.startDate,
    required this.endDate,
    this.image,
    this.createdBy,
    this.createdByName,
    required this.isPublic,
    this.maxAttendees,
    this.currentAttendees = 0,
    required this.isRegistered,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Check if event is upcoming
  bool get isUpcoming => startDate.isAfter(DateTime.now());

  /// Check if event is ongoing
  bool get isOngoing {
    final now = DateTime.now();
    return now.isAfter(startDate) && now.isBefore(endDate);
  }

  /// Check if event is past
  bool get isPast => endDate.isBefore(DateTime.now());

  /// Check if event is full
  bool get isFull {
    if (maxAttendees == null) return false;
    return currentAttendees >= maxAttendees!;
  }

  /// Get event status display
  String get statusDisplay {
    if (isOngoing) return 'Ongoing';
    if (isUpcoming) return 'Upcoming';
    return 'Past';
  }

  /// Get duration in hours
  int get durationHours {
    return endDate.difference(startDate).inHours;
  }

  /// Get days until event
  int get daysUntil {
    if (!isUpcoming) return 0;
    return startDate.difference(DateTime.now()).inDays;
  }

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      location: json['location'],
      startDate: json['start_date'] != null
          ? DateTime.parse(json['start_date'])
          : DateTime.now(),
      endDate: json['end_date'] != null
          ? DateTime.parse(json['end_date'])
          : DateTime.now(),
      image: json['image'],
      createdBy: json['created_by'],
      createdByName: json['created_by_name'],
      isPublic: json['is_public'] ?? true,
      maxAttendees: json['max_attendees'],
      currentAttendees: json['current_attendees'] ?? 0,
      isRegistered: json['is_registered'] ?? false,
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
      'description': description,
      'location': location,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate.toIso8601String(),
      'image': image,
      'created_by': createdBy,
      'created_by_name': createdByName,
      'is_public': isPublic,
      'max_attendees': maxAttendees,
      'current_attendees': currentAttendees,
      'is_registered': isRegistered,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Event copyWith({
    int? id,
    String? title,
    String? description,
    String? location,
    DateTime? startDate,
    DateTime? endDate,
    String? image,
    int? createdBy,
    String? createdByName,
    bool? isPublic,
    int? maxAttendees,
    int? currentAttendees,
    bool? isRegistered,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Event(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      location: location ?? this.location,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      image: image ?? this.image,
      createdBy: createdBy ?? this.createdBy,
      createdByName: createdByName ?? this.createdByName,
      isPublic: isPublic ?? this.isPublic,
      maxAttendees: maxAttendees ?? this.maxAttendees,
      currentAttendees: currentAttendees ?? this.currentAttendees,
      isRegistered: isRegistered ?? this.isRegistered,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Event Create Data
class EventCreateData {
  final String title;
  final String description;
  final String? location;
  final DateTime startDate;
  final DateTime endDate;
  final String? image;
  final bool isPublic;
  final int? maxAttendees;

  EventCreateData({
    required this.title,
    required this.description,
    this.location,
    required this.startDate,
    required this.endDate,
    this.image,
    this.isPublic = true,
    this.maxAttendees,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'description': description,
      'location': location,
      'start_date': startDate.toIso8601String(),
      'end_date': endDate.toIso8601String(),
      'image': image,
      'is_public': isPublic,
      'max_attendees': maxAttendees,
    };
  }
}
