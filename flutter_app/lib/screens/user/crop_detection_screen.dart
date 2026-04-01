import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../widgets/widgets.dart';

/// Crop Detection Screen - Detect crop problems using camera
class CropDetectionScreen extends StatelessWidget {
  const CropDetectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Crop Problem Detection'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Info Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Icon(
                    Icons.camera_alt,
                    size: 48,
                    color: AppColors.primary,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Detect Crop Problems',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Take a photo of your crop and our AI will identify potential issues and suggest solutions.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            // Take Photo Button
            AppButton(
              text: 'Take Photo',
              icon: Icons.camera_alt,
              onPressed: () {
                _showImageSourceDialog(context);
              },
            ),
            const SizedBox(height: 16),
            // Choose from Gallery Button
            AppButton(
              text: 'Choose from Gallery',
              icon: Icons.photo_library,
              isOutlined: true,
              onPressed: () {
                // Choose from gallery
              },
            ),
            const SizedBox(height: 32),
            // Recent Detections
            Text(
              'Recent Detections',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            const Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.history,
                      size: 48,
                      color: AppColors.textHint,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'No recent detections',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showImageSourceDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt),
                title: const Text('Take Photo'),
                onTap: () {
                  Navigator.pop(context);
                  // Take photo
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library),
                title: const Text('Choose from Gallery'),
                onTap: () {
                  Navigator.pop(context);
                  // Choose from gallery
                },
              ),
            ],
          ),
        );
      },
    );
  }
}
