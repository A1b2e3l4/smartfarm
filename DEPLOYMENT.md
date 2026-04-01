# SmartFarm Deployment Guide

This guide will walk you through deploying the SmartFarm application to production environments.

## Table of Contents

1. [Database Setup (Supabase)](#database-setup-supabase)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Mobile App Build](#mobile-app-build)
4. [Environment Variables](#environment-variables)

---

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up/login
2. Click "New Project"
3. Enter project details:
   - Name: `smartfarm`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users (e.g., `Singapore` for Asia, `N. Virginia` for US)
4. Click "Create new project"
5. Wait for the project to be created (this may take a few minutes)

### 2. Run Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Click "New query"
3. Copy the contents of `database/schema.sql`
4. Paste into the SQL Editor
5. Click "Run"

### 3. Get Database Connection String

1. Go to **Settings** → **Database**
2. Under "Connection string", select **URI**
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your actual database password

The connection string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxx.supabase.co:5432/postgres
```

---

## Backend Deployment (Render)

Render supports Docker deployments which provide better consistency and isolation. The backend includes a `Dockerfile` for containerized deployment.

### Option 1: Deploy with Docker (Recommended)

#### 1. Create Render Account

1. Go to [Render](https://render.com/) and sign up/login
2. You can sign up with GitHub for easier integration

#### 2. Create New Web Service

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository (or use "Public Git repository")
3. Configure the service:
   - **Name**: `smartfarm-api`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Build Context Directory**: `./backend`

#### 3. Configure Environment Variables

Add the following environment variables in Render dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `DB_HOST` | `db.xxxxxxxxxx.supabase.co` | From Supabase connection string |
| `DB_PORT` | `5432` | PostgreSQL default port |
| `DB_NAME` | `postgres` | Supabase database name |
| `DB_USER` | `postgres` | Supabase username |
| `DB_PASSWORD` | `your-password` | Your Supabase password |
| `JWT_SECRET` | `your-random-secret-key` | Generate a random string (min 32 chars) |

#### 4. Deploy

1. Click "Create Web Service"
2. Render will build and deploy your Docker container
3. Once deployed, note your service URL (e.g., `https://smartfarm-api.onrender.com`)

---

### Option 2: Deploy with Render Blueprint (IaC)

The project includes a `render.yaml` file for Infrastructure as Code deployment.

#### 1. Push Code to GitHub

Ensure your code is in a GitHub repository with the `render.yaml` file in the root.

#### 2. Create Blueprint on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "Blueprints" → "New Blueprint Instance"
3. Connect your GitHub repository
4. Render will automatically read the `render.yaml` and create:
   - Web Service for the API
   - PostgreSQL database (optional - you can still use Supabase)

#### 3. Configure Secrets

The Blueprint will auto-generate a `JWT_SECRET`. Update the database connection to use Supabase if preferred.

---

### Option 3: Build and Run Docker Locally

For local testing with Docker:

```bash
# Navigate to backend directory
cd backend

# Build Docker image
docker build -t smartfarm-api .

# Run container
docker run -p 8080:80 \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=smartfarm \
  -e DB_USER=postgres \
  -e DB_PASSWORD=your-password \
  -e JWT_SECRET=your-secret \
  smartfarm-api

# Test health endpoint
curl http://localhost:8080/api/health.php
```

---

### Test API

Test your deployed API:
```bash
# Health check
curl https://your-service.onrender.com/api/health.php

# Login
curl https://your-service.onrender.com/api/auth.php?action=login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartfarm.com","password":"admin123"}'
```

---

## Mobile App Build

### 1. Update API Configuration

Edit `flutter_app/.env`:
```
API_BASE_URL=https://your-render-api.onrender.com/api
```

### 2. Build for Android

```bash
cd flutter_app

# Get dependencies
flutter pub get

# Build APK
flutter build apk --release

# Build App Bundle (for Play Store)
flutter build appbundle --release
```

Output:
- APK: `build/app/outputs/flutter-apk/app-release.apk`
- AAB: `build/app/outputs/bundle/release/app-release.aab`

### 3. Build for iOS

```bash
cd flutter_app

# Get dependencies
flutter pub get

# Build iOS
flutter build ios --release

# Or build IPA for distribution
flutter build ipa --release
```

**Note**: iOS builds require macOS and Xcode.

### 4. Configure App Icons and Splash Screen

#### Android
1. Replace icons in `android/app/src/main/res/mipmap-*/`
2. Update `AndroidManifest.xml` with your app name

#### iOS
1. Open `ios/Runner.xcworkspace` in Xcode
2. Update app icons in Assets.xcassets
3. Update app name in Info.plist

---

## Environment Variables

### Flutter App (.env)

```
# API Configuration
API_BASE_URL=https://your-render-api.onrender.com/api
API_VERSION=v1

# Supabase Configuration (for direct access if needed)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# App Configuration
APP_NAME=SmartFarm
DEFAULT_LANGUAGE=en
ENABLE_DARK_MODE=true
```

### Backend (Render Environment Variables)

```
DB_HOST=db.xxxxxxxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-supabase-password
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
```

---

## Post-Deployment Checklist

- [ ] Database schema created in Supabase
- [ ] Default admin user created
- [ ] Backend deployed to Render
- [ ] Environment variables configured
- [ ] API endpoints tested
- [ ] Mobile app built successfully
- [ ] App icons configured
- [ ] Splash screen customized
- [ ] App published to Play Store/App Store (optional)

---

## Troubleshooting

### Database Connection Issues

1. Verify connection string in Render environment variables
2. Check Supabase project is active
3. Ensure IP allowlist includes Render's IPs (if using IP restrictions)

### API Not Responding

1. Check Render service logs
2. Verify all environment variables are set
3. Test database connection from Render

### App Can't Connect to API

1. Verify `API_BASE_URL` in `.env` file
2. Check CORS configuration in backend
3. Ensure device/emulator has internet access

---

## Security Recommendations

1. **Change default admin password** immediately after first login
2. **Use strong JWT secret** (minimum 32 characters, random)
3. **Enable Row Level Security** in Supabase for production
4. **Use HTTPS** for all API communications
5. **Regularly update dependencies** to patch security vulnerabilities
6. **Implement rate limiting** for API endpoints
7. **Add request validation** for all user inputs

---

## Support

For issues and questions:
- Check the [README.md](README.md) for project overview
- Review API documentation in the backend code
- Check Flutter documentation for mobile-specific issues
