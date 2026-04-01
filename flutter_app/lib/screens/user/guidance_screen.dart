import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';

/// Guidance Screen - Farming best practices and livestock management
class GuidanceScreen extends StatelessWidget {
  const GuidanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Farming Guide'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'Crops', icon: Icon(Icons.grass)),
              Tab(text: 'Livestock', icon: Icon(Icons.pets)),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            _CropGuidanceTab(),
            _LivestockGuidanceTab(),
          ],
        ),
      ),
    );
  }
}

class _CropGuidanceTab extends StatelessWidget {
  const _CropGuidanceTab();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.grass,
            size: 64,
            color: AppColors.textHint,
          ),
          SizedBox(height: 16),
          Text(
            'Crop Farming Guide',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Best practices for planting and harvesting',
            style: TextStyle(
              color: AppColors.textHint,
            ),
          ),
        ],
      ),
    );
  }
}

class _LivestockGuidanceTab extends StatelessWidget {
  const _LivestockGuidanceTab();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.pets,
            size: 64,
            color: AppColors.textHint,
          ),
          SizedBox(height: 16),
          Text(
            'Livestock Management',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Tips for managing your livestock',
            style: TextStyle(
              color: AppColors.textHint,
            ),
          ),
        ],
      ),
    );
  }
}
