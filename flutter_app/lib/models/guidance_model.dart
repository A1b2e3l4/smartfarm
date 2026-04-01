import '../constants/app_constants.dart';

/// Guidance Model - For farming best practices and livestock management
class Guidance {
  final int id;
  final String title;
  final String content;
  final String type;
  final String? category;
  final List<String>? images;
  final String? videoUrl;
  final String? documentUrl;
  final int? createdBy;
  final String? createdByName;
  final int viewCount;
  final bool isFeatured;
  final DateTime createdAt;
  final DateTime updatedAt;

  Guidance({
    required this.id,
    required this.title,
    required this.content,
    required this.type,
    this.category,
    this.images,
    this.videoUrl,
    this.documentUrl,
    this.createdBy,
    this.createdByName,
    this.viewCount = 0,
    required this.isFeatured,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Check if guidance is for crops
  bool get isCropGuidance => type == AppConstants.guidanceTypeCrop;

  /// Check if guidance is for livestock
  bool get isLivestockGuidance => type == AppConstants.guidanceTypeLivestock;

  /// Get type display name
  String get typeDisplay {
    switch (type) {
      case 'crop':
        return 'Crop Farming';
      case 'livestock':
        return 'Livestock Management';
      default:
        return type;
    }
  }

  factory Guidance.fromJson(Map<String, dynamic> json) {
    return Guidance(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      type: json['type'] ?? AppConstants.guidanceTypeCrop,
      category: json['category'],
      images: json['images'] != null
          ? List<String>.from(json['images'])
          : null,
      videoUrl: json['video_url'],
      documentUrl: json['document_url'],
      createdBy: json['created_by'],
      createdByName: json['created_by_name'],
      viewCount: json['view_count'] ?? 0,
      isFeatured: json['is_featured'] ?? false,
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
      'content': content,
      'type': type,
      'category': category,
      'images': images,
      'video_url': videoUrl,
      'document_url': documentUrl,
      'created_by': createdBy,
      'created_by_name': createdByName,
      'view_count': viewCount,
      'is_featured': isFeatured,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  Guidance copyWith({
    int? id,
    String? title,
    String? content,
    String? type,
    String? category,
    List<String>? images,
    String? videoUrl,
    String? documentUrl,
    int? createdBy,
    String? createdByName,
    int? viewCount,
    bool? isFeatured,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Guidance(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      type: type ?? this.type,
      category: category ?? this.category,
      images: images ?? this.images,
      videoUrl: videoUrl ?? this.videoUrl,
      documentUrl: documentUrl ?? this.documentUrl,
      createdBy: createdBy ?? this.createdBy,
      createdByName: createdByName ?? this.createdByName,
      viewCount: viewCount ?? this.viewCount,
      isFeatured: isFeatured ?? this.isFeatured,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Guidance Create Data
class GuidanceCreateData {
  final String title;
  final String content;
  final String type;
  final String? category;
  final List<String>? images;
  final String? videoUrl;
  final String? documentUrl;
  final bool isFeatured;

  GuidanceCreateData({
    required this.title,
    required this.content,
    required this.type,
    this.category,
    this.images,
    this.videoUrl,
    this.documentUrl,
    this.isFeatured = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'content': content,
      'type': type,
      'category': category,
      'images': images,
      'video_url': videoUrl,
      'document_url': documentUrl,
      'is_featured': isFeatured,
    };
  }
}
