import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:permission_handler/permission_handler.dart';
import '../constants/app_constants.dart';

/// Image Service - Handles camera and gallery operations
class ImageService {
  static final ImageService _instance = ImageService._internal();
  factory ImageService() => _instance;
  ImageService._internal();

  final ImagePicker _picker = ImagePicker();

  // ==================== Permission Handling ====================

  /// Request camera permission
  Future<bool> requestCameraPermission() async {
    final status = await Permission.camera.request();
    return status.isGranted;
  }

  /// Request storage permission
  Future<bool> requestStoragePermission() async {
    final status = await Permission.storage.request();
    return status.isGranted;
  }

  /// Request photos permission (iOS)
  Future<bool> requestPhotosPermission() async {
    final status = await Permission.photos.request();
    return status.isGranted;
  }

  /// Check if camera permission is granted
  Future<bool> hasCameraPermission() async {
    return await Permission.camera.isGranted;
  }

  /// Check if storage permission is granted
  Future<bool> hasStoragePermission() async {
    return await Permission.storage.isGranted;
  }

  // ==================== Image Picking ====================

  /// Pick image from camera
  Future<File?> pickImageFromCamera({
    bool cropImage = true,
    CropAspectRatio? aspectRatio,
  }) async {
    try {
      // Check permission
      final hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        throw Exception('Camera permission denied');
      }

      // Pick image
      final XFile? pickedFile = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: AppConstants.imageQuality,
        maxWidth: AppConstants.maxImageWidth,
        maxHeight: AppConstants.maxImageHeight,
      );

      if (pickedFile == null) return null;

      // Crop image if requested
      if (cropImage) {
        return await cropImageFile(
          File(pickedFile.path),
          aspectRatio: aspectRatio,
        );
      }

      return File(pickedFile.path);
    } catch (e) {
      debugPrint('Error picking image from camera: $e');
      return null;
    }
  }

  /// Pick image from gallery
  Future<File?> pickImageFromGallery({
    bool cropImage = true,
    CropAspectRatio? aspectRatio,
  }) async {
    try {
      // Check permission
      final hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        // Try photos permission for iOS
        final hasPhotosPermission = await requestPhotosPermission();
        if (!hasPhotosPermission) {
          throw Exception('Storage permission denied');
        }
      }

      // Pick image
      final XFile? pickedFile = await _picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: AppConstants.imageQuality,
        maxWidth: AppConstants.maxImageWidth,
        maxHeight: AppConstants.maxImageHeight,
      );

      if (pickedFile == null) return null;

      // Crop image if requested
      if (cropImage) {
        return await cropImageFile(
          File(pickedFile.path),
          aspectRatio: aspectRatio,
        );
      }

      return File(pickedFile.path);
    } catch (e) {
      debugPrint('Error picking image from gallery: $e');
      return null;
    }
  }

  /// Pick multiple images from gallery
  Future<List<File>> pickMultipleImagesFromGallery({
    int maxImages = 5,
  }) async {
    try {
      // Check permission
      final hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        final hasPhotosPermission = await requestPhotosPermission();
        if (!hasPhotosPermission) {
          throw Exception('Storage permission denied');
        }
      }

      // Pick multiple images
      final List<XFile> pickedFiles = await _picker.pickMultiImage(
        imageQuality: AppConstants.imageQuality,
        maxWidth: AppConstants.maxImageWidth,
        maxHeight: AppConstants.maxImageHeight,
      );

      if (pickedFiles.isEmpty) return [];

      // Limit to maxImages
      final limitedFiles = pickedFiles.take(maxImages).toList();
      return limitedFiles.map((file) => File(file.path)).toList();
    } catch (e) {
      debugPrint('Error picking multiple images: $e');
      return [];
    }
  }

  /// Show image source dialog
  Future<File?> showImageSourceDialog(
    BuildContext context, {
    bool cropImage = true,
    CropAspectRatio? aspectRatio,
    String? title,
  }) async {
    final ImageSource? source = await showDialog<ImageSource>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(title ?? 'Select Image Source'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Camera'),
                onTap: () => Navigator.pop(context, ImageSource.camera),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Gallery'),
                onTap: () => Navigator.pop(context, ImageSource.gallery),
              ),
            ],
          ),
        );
      },
    );

    if (source == null) return null;

    if (source == ImageSource.camera) {
      return await pickImageFromCamera(
        cropImage: cropImage,
        aspectRatio: aspectRatio,
      );
    } else {
      return await pickImageFromGallery(
        cropImage: cropImage,
        aspectRatio: aspectRatio,
      );
    }
  }

  // ==================== Image Cropping ====================

  /// Crop image file
  Future<File?> cropImageFile(
    File imageFile, {
    CropAspectRatio? aspectRatio,
  }) async {
    try {
      final CroppedFile? croppedFile = await ImageCropper().cropImage(
        sourcePath: imageFile.path,
        aspectRatio: aspectRatio ?? const CropAspectRatio(ratioX: 1, ratioY: 1),
        compressQuality: AppConstants.imageQuality,
        maxWidth: AppConstants.maxImageWidth.toInt(),
        maxHeight: AppConstants.maxImageHeight.toInt(),
        uiSettings: [
          AndroidUiSettings(
            toolbarTitle: 'Crop Image',
            toolbarColor: Colors.green,
            toolbarWidgetColor: Colors.white,
            initAspectRatio: CropAspectRatioPreset.original,
            lockAspectRatio: aspectRatio != null,
          ),
          IOSUiSettings(
            title: 'Crop Image',
            aspectRatioLockEnabled: aspectRatio != null,
          ),
        ],
      );

      if (croppedFile == null) return null;
      return File(croppedFile.path);
    } catch (e) {
      debugPrint('Error cropping image: $e');
      return null;
    }
  }

  // ==================== Image Validation ====================

  /// Validate image file
  Future<ImageValidationResult> validateImage(File imageFile) async {
    // Check file size
    final fileSize = await imageFile.length();
    final maxSize = AppConstants.maxImageSizeMB * 1024 * 1024;

    if (fileSize > maxSize) {
      return ImageValidationResult(
        isValid: false,
        errorMessage:
            'Image size exceeds ${AppConstants.maxImageSizeMB}MB limit',
      );
    }

    // Check file extension
    final extension = imageFile.path.split('.').last.toLowerCase();
    if (!AppConstants.allowedImageTypes.contains(extension)) {
      return ImageValidationResult(
        isValid: false,
        errorMessage:
            'Invalid image format. Allowed formats: ${AppConstants.allowedImageTypes.join(', ')}',
      );
    }

    return ImageValidationResult(isValid: true);
  }

  /// Validate multiple images
  Future<List<ImageValidationResult>> validateMultipleImages(
    List<File> images,
  ) async {
    final results = <ImageValidationResult>[];
    for (final image in images) {
      results.add(await validateImage(image));
    }
    return results;
  }

  // ==================== Image Utilities ====================

  /// Get image file size in MB
  Future<double> getImageSizeInMB(File imageFile) async {
    final bytes = await imageFile.length();
    return bytes / (1024 * 1024);
  }

  /// Compress image if needed
  Future<File?> compressImageIfNeeded(File imageFile) async {
    final sizeInMB = await getImageSizeInMB(imageFile);
    if (sizeInMB <= AppConstants.maxImageSizeMB) {
      return imageFile;
    }

    // Image needs compression - this is handled by image_picker
    // with imageQuality parameter
    return imageFile;
  }

  /// Delete image file
  Future<bool> deleteImage(File imageFile) async {
    try {
      await imageFile.delete();
      return true;
    } catch (e) {
      debugPrint('Error deleting image: $e');
      return false;
    }
  }
}

/// Image validation result
class ImageValidationResult {
  final bool isValid;
  final String? errorMessage;

  ImageValidationResult({
    required this.isValid,
    this.errorMessage,
  });
}

/// Predefined crop aspect ratios
class CropAspectRatios {
  CropAspectRatios._();

  static const CropAspectRatio square = CropAspectRatio(
    ratioX: 1,
    ratioY: 1,
  );

  static const CropAspectRatio portrait = CropAspectRatio(
    ratioX: 3,
    ratioY: 4,
  );

  static const CropAspectRatio landscape = CropAspectRatio(
    ratioX: 4,
    ratioY: 3,
  );

  static const CropAspectRatio widescreen = CropAspectRatio(
    ratioX: 16,
    ratioY: 9,
  );
}
