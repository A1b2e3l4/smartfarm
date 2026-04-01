/// Crop Problem Model - For crop disease/pest detection
class CropProblem {
  final int id;
  final int? userId;
  final String? userName;
  final String cropName;
  final String? problemType;
  final String description;
  final List<String> images;
  final String? detectedIssue;
  final String? confidence;
  final String? solution;
  final String? prevention;
  final String? treatment;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  CropProblem({
    required this.id,
    this.userId,
    this.userName,
    required this.cropName,
    this.problemType,
    required this.description,
    required this.images,
    this.detectedIssue,
    this.confidence,
    this.solution,
    this.prevention,
    this.treatment,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  /// Check if problem is pending analysis
  bool get isPending => status == 'pending';

  /// Check if problem has been analyzed
  bool get isAnalyzed => status == 'analyzed';

  /// Check if problem is resolved
  bool get isResolved => status == 'resolved';

  /// Get confidence percentage
  double? get confidencePercent {
    if (confidence == null) return null;
    return double.tryParse(confidence!.replaceAll('%', ''));
  }

  factory CropProblem.fromJson(Map<String, dynamic> json) {
    return CropProblem(
      id: json['id'] ?? 0,
      userId: json['user_id'],
      userName: json['user_name'],
      cropName: json['crop_name'] ?? '',
      problemType: json['problem_type'],
      description: json['description'] ?? '',
      images: json['images'] != null
          ? List<String>.from(json['images'])
          : [],
      detectedIssue: json['detected_issue'],
      confidence: json['confidence'],
      solution: json['solution'],
      prevention: json['prevention'],
      treatment: json['treatment'],
      status: json['status'] ?? 'pending',
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
      'user_id': userId,
      'user_name': userName,
      'crop_name': cropName,
      'problem_type': problemType,
      'description': description,
      'images': images,
      'detected_issue': detectedIssue,
      'confidence': confidence,
      'solution': solution,
      'prevention': prevention,
      'treatment': treatment,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  CropProblem copyWith({
    int? id,
    int? userId,
    String? userName,
    String? cropName,
    String? problemType,
    String? description,
    List<String>? images,
    String? detectedIssue,
    String? confidence,
    String? solution,
    String? prevention,
    String? treatment,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return CropProblem(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      cropName: cropName ?? this.cropName,
      problemType: problemType ?? this.problemType,
      description: description ?? this.description,
      images: images ?? this.images,
      detectedIssue: detectedIssue ?? this.detectedIssue,
      confidence: confidence ?? this.confidence,
      solution: solution ?? this.solution,
      prevention: prevention ?? this.prevention,
      treatment: treatment ?? this.treatment,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

/// Crop Problem Detection Request
class CropProblemDetectionRequest {
  final String cropName;
  final String? problemType;
  final String description;
  final List<String> images;

  CropProblemDetectionRequest({
    required this.cropName,
    this.problemType,
    required this.description,
    required this.images,
  });

  Map<String, dynamic> toJson() {
    return {
      'crop_name': cropName,
      'problem_type': problemType,
      'description': description,
      'images': images,
    };
  }
}

/// Crop Problem Detection Response
class CropProblemDetectionResponse {
  final String detectedIssue;
  final String confidence;
  final String solution;
  final String prevention;
  final String? treatment;
  final List<String>? similarImages;
  final List<String>? recommendedProducts;

  CropProblemDetectionResponse({
    required this.detectedIssue,
    required this.confidence,
    required this.solution,
    required this.prevention,
    this.treatment,
    this.similarImages,
    this.recommendedProducts,
  });

  factory CropProblemDetectionResponse.fromJson(Map<String, dynamic> json) {
    return CropProblemDetectionResponse(
      detectedIssue: json['detected_issue'] ?? '',
      confidence: json['confidence'] ?? '',
      solution: json['solution'] ?? '',
      prevention: json['prevention'] ?? '',
      treatment: json['treatment'],
      similarImages: json['similar_images'] != null
          ? List<String>.from(json['similar_images'])
          : null,
      recommendedProducts: json['recommended_products'] != null
          ? List<String>.from(json['recommended_products'])
          : null,
    );
  }
}

/// Common Crop Problem
class CommonCropProblem {
  final String id;
  final String name;
  final String cropType;
  final String description;
  final List<String> symptoms;
  final String solution;
  final String prevention;
  final String? image;

  CommonCropProblem({
    required this.id,
    required this.name,
    required this.cropType,
    required this.description,
    required this.symptoms,
    required this.solution,
    required this.prevention,
    this.image,
  });

  factory CommonCropProblem.fromJson(Map<String, dynamic> json) {
    return CommonCropProblem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      cropType: json['crop_type'] ?? '',
      description: json['description'] ?? '',
      symptoms: json['symptoms'] != null
          ? List<String>.from(json['symptoms'])
          : [],
      solution: json['solution'] ?? '',
      prevention: json['prevention'] ?? '',
      image: json['image'],
    );
  }
}
