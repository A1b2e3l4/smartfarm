/// SmartFarm App Constants
class AppConstants {
  AppConstants._();

  // App Info
  static const String appName = 'SmartFarm';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'Smart Farming for a Better Tomorrow';

  // API Endpoints
  static const String apiVersion = 'v1';

  // Auth Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String refreshToken = '/auth/refresh';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String verifyEmail = '/auth/verify-email';
  static const String changePassword = '/auth/change-password';

  // User Endpoints
  static const String users = '/users';
  static const String userProfile = '/users/profile';
  static const String updateProfile = '/users/profile/update';
  static const String uploadAvatar = '/users/profile/avatar';
  static const String userStats = '/users/stats';

  // Crop Endpoints
  static const String crops = '/crops';
  static const String cropDetails = '/crops/details';
  static const String cropCreate = '/crops/create';
  static const String cropUpdate = '/crops/update';
  static const String cropDelete = '/crops/delete';
  static const String cropApprove = '/crops/approve';
  static const String cropSearch = '/crops/search';
  static const String cropFilter = '/crops/filter';
  static const String myCrops = '/crops/my-crops';

  // Order Endpoints
  static const String orders = '/orders';
  static const String orderCreate = '/orders/create';
  static const String orderUpdate = '/orders/update';
  static const String orderCancel = '/orders/cancel';
  static const String orderHistory = '/orders/history';
  static const String orderDetails = '/orders/details';

  // Market Price Endpoints
  static const String marketPrices = '/market-prices';
  static const String marketPriceUpdate = '/market-prices/update';
  static const String marketTrends = '/market-prices/trends';

  // Alert Endpoints
  static const String alerts = '/alerts';
  static const String alertCreate = '/alerts/create';
  static const String alertUpdate = '/alerts/update';
  static const String alertDelete = '/alerts/delete';
  static const String alertApprove = '/alerts/approve';
  static const String myAlerts = '/alerts/my-alerts';

  // Event Endpoints
  static const String events = '/events';
  static const String eventCreate = '/events/create';
  static const String eventUpdate = '/events/update';
  static const String eventDelete = '/events/delete';
  static const String upcomingEvents = '/events/upcoming';

  // Guidance Endpoints
  static const String guidance = '/guidance';
  static const String guidanceCreate = '/guidance/create';
  static const String guidanceUpdate = '/guidance/update';
  static const String guidanceDelete = '/guidance/delete';
  static const String cropGuidance = '/guidance/crops';
  static const String livestockGuidance = '/guidance/livestock';

  // Crop Problem Detection Endpoints
  static const String cropProblemDetect = '/crop-problems/detect';
  static const String cropProblemHistory = '/crop-problems/history';
  static const String cropProblemDetails = '/crop-problems/details';

  // Admin Endpoints
  static const String adminDashboard = '/admin/dashboard';
  static const String adminUsers = '/admin/users';
  static const String adminStats = '/admin/stats';
  static const String adminLogs = '/admin/logs';
  static const String adminSettings = '/admin/settings';

  // Weather Endpoints
  static const String weather = '/weather';
  static const String weatherForecast = '/weather/forecast';

  // User Roles
  static const String roleAdmin = 'admin';
  static const String roleFarmer = 'farmer';
  static const String roleBuyer = 'buyer';

  // Order Status
  static const String orderPending = 'pending';
  static const String orderConfirmed = 'confirmed';
  static const String orderProcessing = 'processing';
  static const String orderShipped = 'shipped';
  static const String orderDelivered = 'delivered';
  static const String orderCancelled = 'cancelled';

  // Crop Status
  static const String cropPending = 'pending';
  static const String cropApproved = 'approved';
  static const String cropRejected = 'rejected';
  static const String cropSold = 'sold';

  // Alert Types
  static const String alertTypeInfo = 'info';
  static const String alertTypeWarning = 'warning';
  static const String alertTypeDanger = 'danger';
  static const String alertTypeSuccess = 'success';

  // Guidance Types
  static const String guidanceTypeCrop = 'crop';
  static const String guidanceTypeLivestock = 'livestock';

  // Shared Preferences Keys
  static const String prefToken = 'token';
  static const String prefRefreshToken = 'refresh_token';
  static const String prefUser = 'user';
  static const String prefIsLoggedIn = 'is_logged_in';
  static const String prefTheme = 'theme';
  static const String prefLanguage = 'language';
  static const String prefFirstLaunch = 'first_launch';

  // Image Configuration
  static const int maxImageSizeMB = 5;
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png'];
  static const int imageQuality = 85;
  static const double maxImageWidth = 1200;
  static const double maxImageHeight = 1200;

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Timeouts
  static const int connectionTimeout = 30000;
  static const int receiveTimeout = 30000;
  static const int sendTimeout = 30000;

  // Animation Durations
  static const int animationShort = 200;
  static const int animationMedium = 350;
  static const int animationLong = 500;

  // Debounce Time
  static const int searchDebounceMs = 500;

  // Date Formats
  static const String dateFormat = 'dd MMM yyyy';
  static const String dateTimeFormat = 'dd MMM yyyy, HH:mm';
  static const String timeFormat = 'HH:mm';
  static const String apiDateFormat = 'yyyy-MM-dd';
  static const String apiDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';

  // Currency
  static const String currencySymbol = 'KSh';
  static const String currencyCode = 'KES';

  // Measurement Units
  static const String unitKg = 'kg';
  static const String unitTon = 'ton';
  static const String unitBag = 'bag';
  static const String unitPiece = 'piece';
  static const String unitLitre = 'litre';

  // Languages
  static const String languageEnglish = 'en';
  static const String languageSwahili = 'sw';
}
