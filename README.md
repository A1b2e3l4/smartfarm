# SmartFarm Platform

A complete agricultural marketplace platform connecting farmers with buyers. Built with React Native (Expo), PHP Backend, and PostgreSQL database.

## 📁 Project Structure

```
smartfarm/
├── database/               # PostgreSQL database schema
│   └── schema.sql         # Complete database schema
├── backend/               # PHP REST API
│   ├── config/           # Database & JWT configuration
│   ├── auth/             # Authentication endpoints
│   ├── users/            # User management
│   ├── crops/            # Crop management
│   ├── orders/           # Order management
│   ├── dashboard/        # Dashboard statistics
│   ├── admin/            # Admin endpoints
│   ├── uploads/          # Uploaded files storage
│   ├── index.php         # Main API router
│   └── .htaccess         # Apache configuration
├── mobile-app/           # React Native Expo app
│   └── SmartFarm/
│       ├── src/
│       │   ├── components/   # Reusable UI components
│       │   ├── screens/      # App screens
│       │   ├── navigation/   # Navigation setup
│       │   ├── services/     # API services
│       │   ├── context/      # Auth context
│       │   └── assets/       # Images & fonts
│       ├── package.json
│       └── app.json
└── admin-panel/          # Web-based admin dashboard
    ├── index.html
    ├── styles.css
    └── app.js
```

## 🚀 Quick Start

### 1. Database Setup (Supabase)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor
4. Copy the contents of `database/schema.sql`
5. Run the SQL to create all tables, indexes, and views
6. Note your database credentials for the next step

### 2. Backend Deployment (Render)

1. Create a free account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository or upload the backend folder
4. Configure environment variables:
   ```
   DB_HOST=your-project.supabase.co
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_PORT=5432
   JWT_SECRET=your-super-secret-key
   ```
5. Deploy and note your backend URL

### 3. Mobile App Setup

```bash
cd mobile-app/SmartFarm

# Install dependencies
npm install

# Update API URL in src/services/api.js
# Change API_URL to your Render backend URL

# Start the app
npx expo start
```

### 4. Admin Panel Deployment (Vercel)

1. Create a free account at [vercel.com](https://vercel.com)
2. Upload the `admin-panel` folder
3. Deploy instantly
4. Update the API_URL in `app.js` to your Render backend URL

## 📱 Mobile App Features

### Authentication
- User registration (Farmer/Buyer roles)
- Login with JWT token storage
- Profile management with image upload
- Logout functionality

### Farmer Features
- Add/edit/delete crops
- View crop listings
- Manage orders from buyers
- Dashboard with earnings stats

### Buyer Features
- Browse all available crops
- Search and filter crops
- View crop details
- Place orders
- Order history

### Order System
- Create orders
- Order status tracking (pending → accepted → delivered)
- Cancel orders
- Order notifications

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Users
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `POST /users/profile/image` - Upload profile image

### Crops
- `GET /crops` - List crops (with filters)
- `POST /crops` - Create new crop
- `GET /crops/:id` - Get crop details
- `PUT /crops/:id` - Update crop
- `DELETE /crops/:id` - Delete crop

### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `GET /orders/:id` - Get order details
- `PUT /orders/:id` - Update order status

### Dashboard
- `GET /dashboard` - Get dashboard statistics

### Admin
- `GET /admin/users` - List all users
- `GET /admin/users/:id` - Get user details
- `PUT /admin/users/:id` - Update user
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/stats` - Platform statistics

## 🛠️ Technology Stack

### Mobile App
- React Native (Expo)
- React Navigation (Stack + Bottom Tabs)
- Axios for API calls
- AsyncStorage for token storage
- Context API for state management

### Backend
- PHP 8.0+
- PostgreSQL
- JWT Authentication
- RESTful API design

### Database
- PostgreSQL (hosted on Supabase)
- UUID primary keys
- Proper indexing
- Database views for analytics

### Admin Panel
- Pure HTML/CSS/JavaScript
- Responsive design
- Chart.js for analytics

## 🔐 Environment Variables

### Backend (.env or Render Environment)
```
DB_HOST=your-db-host
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password
DB_PORT=5432
JWT_SECRET=your-secret-key
```

### Mobile App (src/services/api.js)
```javascript
export const API_URL = 'https://your-backend.onrender.com/api';
```

## 📊 Database Schema

### Tables
- `users` - Farmers, buyers, and admins
- `crops` - Crop listings
- `orders` - Order records
- `categories` - Crop categories
- `notifications` - User notifications
- `admin_logs` - Admin activity tracking
- `settings` - Platform settings

### Views
- `dashboard_summary` - Quick stats overview
- `farmer_stats` - Farmer performance metrics
- `crop_sales_stats` - Crop sales analytics
- `monthly_revenue` - Revenue trends

## 🚀 Building for Production

### Mobile App (APK/IPA)

```bash
# For Android
cd mobile-app/SmartFarm
expo build:android

# For iOS
expo build:ios
```

Or use EAS Build:
```bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

### Backend
- Ensure all environment variables are set
- Configure CORS for your domain
- Set up SSL/HTTPS
- Configure proper error logging

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Support

For support, email support@smartfarm.com or join our Slack channel.

---

Built with ❤️ for the agricultural community.
