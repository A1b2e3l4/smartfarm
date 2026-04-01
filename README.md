# SmartFarm - Mobile Application

A comprehensive farming mobile application for Kenyan farmers, connecting farmers with buyers and providing agricultural guidance, market prices, and crop problem detection.

## Features

### For Farmers & Buyers
- **User Authentication**: Register and login with role-based access (Farmer/Buyer)
- **Marketplace**: Browse, search, and filter crops by location, price, and category
- **Order Management**: Place orders, track order status, view order history
- **Market Prices**: View latest market prices for different crops by county
- **Farming Guidance**: Access best practices for crop farming and livestock management
- **Crop Problem Detection**: Take photos of crops to identify diseases and get treatment suggestions
- **Weather Information**: View weather forecasts based on location
- **Alerts & Events**: Receive notifications about market updates, events, and important announcements
- **Profile Management**: Update personal information, location, and profile picture

### For Admins
- **Dashboard**: View system statistics (users, crops, orders, revenue)
- **User Management**: View, edit, suspend, and delete users
- **Crop Management**: Approve/reject crops, edit or delete listings
- **Market Price Management**: Set and update crop prices
- **Alert & Event Management**: Create and manage system alerts and events
- **Guidance Management**: Add and edit farming guides
- **Audit Trail**: View system logs for all admin actions

## Tech Stack

### Mobile App
- **Framework**: Flutter (Dart)
- **State Management**: Provider
- **HTTP Client**: Dio
- **Image Handling**: Image Picker, Image Cropper
- **Local Storage**: Shared Preferences
- **Charts**: FL Chart

### Backend API
- **Language**: PHP
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Hosting**: Render

### Database
- **Platform**: Supabase (PostgreSQL)
- **Location**: Cloud-hosted

## Project Structure

```
smartfarm/
├── flutter_app/              # Flutter mobile application
│   ├── lib/
│   │   ├── constants/        # App constants, colors, themes
│   │   ├── models/           # Data models
│   │   ├── providers/        # State management
│   │   ├── screens/          # UI screens
│   │   │   ├── auth/         # Authentication screens
│   │   │   ├── user/         # User screens
│   │   │   └── admin/        # Admin screens
│   │   ├── services/         # API services
│   │   ├── widgets/          # Reusable widgets
│   │   └── main.dart         # App entry point
│   ├── android/              # Android-specific files
│   ├── ios/                  # iOS-specific files
│   └── pubspec.yaml          # Dependencies
│
├── backend/                  # PHP Backend API
│   ├── api/                  # API endpoints
│   ├── config/               # Configuration files
│   └── uploads/              # File uploads directory
│
├── database/                 # Database files
│   └── schema.sql            # PostgreSQL schema
│
├── README.md                 # This file
└── DEPLOYMENT.md             # Deployment instructions
```

## Getting Started

### Prerequisites

- Flutter SDK (latest stable version)
- Dart SDK
- PHP 7.4+ (for local backend testing)
- PostgreSQL (for local database)
- Android Studio / Xcode (for emulators)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smartfarm.git
   cd smartfarm
   ```

2. **Setup Flutter App**
   ```bash
   cd flutter_app
   flutter pub get
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update API URLs and keys

4. **Run the App**
   ```bash
   flutter run
   ```

### Backend Setup (Local Development)

1. **Setup Database**
   ```bash
   # Create PostgreSQL database
   createdb smartfarm
   
   # Run schema
   psql smartfarm < database/schema.sql
   ```

2. **Configure Backend**
   - Update `backend/config/database.php` with your database credentials
   - Set JWT secret in environment variables

3. **Run PHP Server**
   ```bash
   cd backend
   php -S localhost:8000
   ```

## Default Credentials

**Admin Account:**
- Email: `admin@smartfarm.com`
- Password: `admin123`

**Note**: Change the default admin password immediately after first login!

## API Endpoints

### Authentication
- `POST /api/auth.php?action=login` - User login
- `POST /api/auth.php?action=register` - User registration
- `POST /api/auth.php?action=logout` - User logout
- `POST /api/auth.php?action=refresh` - Refresh token

### Users
- `GET /api/users.php` - List users
- `GET /api/users.php?id={id}` - Get user details
- `PUT /api/users.php?id={id}` - Update user
- `DELETE /api/users.php?id={id}` - Delete user

### Crops
- `GET /api/crops.php` - List crops
- `POST /api/crops.php` - Create crop
- `PUT /api/crops.php?id={id}` - Update crop
- `DELETE /api/crops.php?id={id}` - Delete crop
- `POST /api/crops.php?id={id}&action=approve` - Approve crop

### Orders
- `GET /api/orders.php` - List orders
- `POST /api/orders.php` - Create order
- `PUT /api/orders.php?id={id}` - Update order
- `POST /api/orders.php?id={id}&action=cancel` - Cancel order

### Market Prices
- `GET /api/market-prices.php` - Get market prices
- `POST /api/market-prices.php` - Update market price

### Alerts
- `GET /api/alerts.php` - List alerts
- `POST /api/alerts.php` - Create alert
- `POST /api/alerts.php?id={id}&action=approve` - Approve alert

### Events
- `GET /api/events.php` - List events
- `POST /api/events.php` - Create event
- `POST /api/events.php?id={id}&action=register` - Register for event

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. **Database**: Create project on [Supabase](https://supabase.com/)
2. **Backend**: Deploy to [Render](https://render.com/)
3. **Mobile App**: Build and distribute via Play Store/App Store

## Screenshots

*(Add screenshots here)*

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Kenya Agricultural & Livestock Research Organization (KALRO) for farming guidance data
- Kenya Meteorological Department for weather data
- All contributors and testers

## Contact

For support or inquiries:
- Email: support@smartfarm.co.ke
- Website: https://smartfarm.co.ke

---

**Built with ❤️ for Kenyan Farmers**
# smartfarm
