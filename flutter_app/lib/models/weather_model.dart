/// Weather Model
class Weather {
  final String location;
  final double temperature;
  final double feelsLike;
  final int humidity;
  final double windSpeed;
  final String windDirection;
  final int pressure;
  final double visibility;
  final String condition;
  final String description;
  final String icon;
  final DateTime sunrise;
  final DateTime sunset;
  final DateTime updatedAt;
  final List<WeatherForecast> forecast;

  Weather({
    required this.location,
    required this.temperature,
    required this.feelsLike,
    required this.humidity,
    required this.windSpeed,
    required this.windDirection,
    required this.pressure,
    required this.visibility,
    required this.condition,
    required this.description,
    required this.icon,
    required this.sunrise,
    required this.sunset,
    required this.updatedAt,
    required this.forecast,
  });

  /// Get temperature in Celsius
  String get temperatureCelsius => '${temperature.round()}°C';

  /// Get feels like temperature
  String get feelsLikeCelsius => '${feelsLike.round()}°C';

  /// Get humidity percentage
  String get humidityPercent => '$humidity%';

  /// Get wind speed display
  String get windSpeedDisplay => '${windSpeed.toStringAsFixed(1)} km/h';

  /// Get pressure display
  String get pressureDisplay => '$pressure hPa';

  /// Get visibility display
  String get visibilityDisplay => '${visibility.toStringAsFixed(1)} km';

  factory Weather.fromJson(Map<String, dynamic> json) {
    return Weather(
      location: json['location'] ?? '',
      temperature: (json['temperature'] ?? 0).toDouble(),
      feelsLike: (json['feels_like'] ?? 0).toDouble(),
      humidity: json['humidity'] ?? 0,
      windSpeed: (json['wind_speed'] ?? 0).toDouble(),
      windDirection: json['wind_direction'] ?? '',
      pressure: json['pressure'] ?? 0,
      visibility: (json['visibility'] ?? 0).toDouble(),
      condition: json['condition'] ?? '',
      description: json['description'] ?? '',
      icon: json['icon'] ?? '',
      sunrise: json['sunrise'] != null
          ? DateTime.parse(json['sunrise'])
          : DateTime.now(),
      sunset: json['sunset'] != null
          ? DateTime.parse(json['sunset'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
      forecast: json['forecast'] != null
          ? List<WeatherForecast>.from(
              json['forecast'].map((x) => WeatherForecast.fromJson(x)))
          : [],
    );
  }
}

/// Weather Forecast Model
class WeatherForecast {
  final DateTime date;
  final double minTemp;
  final double maxTemp;
  final double avgTemp;
  final int humidity;
  final double windSpeed;
  final String condition;
  final String description;
  final String icon;
  final double precipitation;
  final int precipitationProbability;

  WeatherForecast({
    required this.date,
    required this.minTemp,
    required this.maxTemp,
    required this.avgTemp,
    required this.humidity,
    required this.windSpeed,
    required this.condition,
    required this.description,
    required this.icon,
    required this.precipitation,
    required this.precipitationProbability,
  });

  /// Get day name
  String get dayName {
    final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[date.weekday - 1];
  }

  /// Get temperature range
  String get tempRange => '${minTemp.round()}° - ${maxTemp.round()}°';

  factory WeatherForecast.fromJson(Map<String, dynamic> json) {
    return WeatherForecast(
      date: json['date'] != null
          ? DateTime.parse(json['date'])
          : DateTime.now(),
      minTemp: (json['min_temp'] ?? 0).toDouble(),
      maxTemp: (json['max_temp'] ?? 0).toDouble(),
      avgTemp: (json['avg_temp'] ?? 0).toDouble(),
      humidity: json['humidity'] ?? 0,
      windSpeed: (json['wind_speed'] ?? 0).toDouble(),
      condition: json['condition'] ?? '',
      description: json['description'] ?? '',
      icon: json['icon'] ?? '',
      precipitation: (json['precipitation'] ?? 0).toDouble(),
      precipitationProbability: json['precipitation_probability'] ?? 0,
    );
  }
}

/// Weather Alert Model
class WeatherAlert {
  final String id;
  final String title;
  final String description;
  final String severity;
  final DateTime startTime;
  final DateTime endTime;
  final String? instruction;

  WeatherAlert({
    required this.id,
    required this.title,
    required this.description,
    required this.severity,
    required this.startTime,
    required this.endTime,
    this.instruction,
  });

  /// Check if alert is high severity
  bool get isHighSeverity => severity.toLowerCase() == 'high';

  /// Check if alert is medium severity
  bool get isMediumSeverity => severity.toLowerCase() == 'medium';

  /// Check if alert is low severity
  bool get isLowSeverity => severity.toLowerCase() == 'low';

  factory WeatherAlert.fromJson(Map<String, dynamic> json) {
    return WeatherAlert(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      severity: json['severity'] ?? '',
      startTime: json['start_time'] != null
          ? DateTime.parse(json['start_time'])
          : DateTime.now(),
      endTime: json['end_time'] != null
          ? DateTime.parse(json['end_time'])
          : DateTime.now(),
      instruction: json['instruction'],
    );
  }
}
