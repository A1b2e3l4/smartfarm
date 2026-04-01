import 'package:flutter/material.dart';

/// SmartFarm App Colors
/// Theme: Neon Green, White, and Gray accents
class AppColors {
  AppColors._();

  // Primary Colors - Neon Green
  static const Color primary = Color(0xFF00E676);
  static const Color primaryLight = Color(0xFF69F0AE);
  static const Color primaryDark = Color(0xFF00C853);
  static const Color primaryAccent = Color(0xFF76FF03);

  // Secondary Colors
  static const Color secondary = Color(0xFF2979FF);
  static const Color secondaryLight = Color(0xFF82B1FF);
  static const Color secondaryDark = Color(0xFF2962FF);

  // Background Colors
  static const Color background = Color(0xFFFFFFFF);
  static const Color backgroundDark = Color(0xFF121212);
  static const Color surface = Color(0xFFF5F5F5);
  static const Color surfaceDark = Color(0xFF1E1E1E);

  // Text Colors
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textHint = Color(0xFFBDBDBD);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnDark = Color(0xFFFFFFFF);

  // Status Colors
  static const Color success = Color(0xFF4CAF50);
  static const Color error = Color(0xFFE53935);
  static const Color warning = Color(0xFFFFB300);
  static const Color info = Color(0xFF2196F3);

  // Border Colors
  static const Color border = Color(0xFFE0E0E0);
  static const Color borderDark = Color(0xFF424242);

  // Gradient Colors
  static const List<Color> primaryGradient = [
    Color(0xFF00E676),
    Color(0xFF00C853),
  ];

  static const List<Color> darkGradient = [
    Color(0xFF1E1E1E),
    Color(0xFF121212),
  ];

  // Overlay Colors
  static const Color overlay = Color(0x80000000);
  static const Color overlayLight = Color(0x1F000000);

  // Chart Colors
  static const List<Color> chartColors = [
    Color(0xFF00E676),
    Color(0xFF2979FF),
    Color(0xFFFFB300),
    Color(0xFFE53935),
    Color(0xFF9C27B0),
    Color(0xFF00BCD4),
  ];
}
