# SmartFarm Deployment Guide

This guide will walk you through deploying the SmartFarm platform to production.

## Table of Contents
1. [Database Setup (Supabase)](#1-database-setup-supabase)
2. [Backend Deployment (Render)](#2-backend-deployment-render)
3. [Admin Panel Deployment (Vercel)](#3-admin-panel-deployment-vercel)
4. [Mobile App Build](#4-mobile-app-build)
5. [Environment Configuration](#5-environment-configuration)

---

## 1. Database Setup (Supabase)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

### Step 2: Create New Project
1. Click "New Project"
2. Enter project name: `smartfarm`
3. Choose a database password (save this!)
4. Select region closest to your users
5. Click "Create new project"

### Step 3: Run Database Schema
1. Wait for project to be ready
2. Go to "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy the entire contents of `database/schema.sql`
5. Paste into the SQL editor
6. Click "Run"

### Step 4: Get Connection Details
1. Go to "Settings" (gear icon) → "Database"
2. Under "Connection string", select "URI"
3. Copy the connection string
4. Extract the following:
   - Host: `your-project.supabase.co`
   - Port: `5432`
   - Database: `postgres`
   - User: `postgres`
   - Password: (from step 2)

---

## 2. Backend Deployment (Render)

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub or email

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository (or use "Upload" option)
3. Select the `backend` folder

### Step 3: Configure Service
- **Name**: `smartfarm-api`
- **Environment**: `PHP`
- **Build Command**: (leave empty)
- **Start Command**: (leave empty)

### Step 4: Add Environment Variables
Click "Advanced" and add:
```
DB_HOST=your-project.supabase.co
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-database-password
DB_PORT=5432
JWT_SECRET=your-super-secret-random-string-min-32-characters
```

### Step 5: Deploy
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your service URL: `https://smartfarm-api.onrender.com`

### Step 6: Test API
Open browser and visit:
```
https://smartfarm-api.onrender.com/api
```
You should see the API welcome message.

---

## 3. Admin Panel Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub or email

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository (or use "Upload" option)
3. Select the `admin-panel` folder

### Step 3: Configure
- **Framework Preset**: `Other`
- **Root Directory**: `admin-panel`
- **Build Command**: (leave empty)
- **Output Directory**: `.`

### Step 4: Update API URL
Before deploying, edit `admin-panel/app.js`:
```javascript
const API_URL = 'https://your-render-url.onrender.com/api';
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment
3. Your admin panel is live!

---

## 4. Mobile App Build

### Step 1: Update API URL
Edit `mobile-app/SmartFarm/src/services/api.js`:
```javascript
export const API_URL = 'https://your-render-url.onrender.com/api';
```

### Step 2: Install Dependencies
```bash
cd mobile-app/SmartFarm
npm install
```

### Step 3: Test Locally
```bash
npx expo start
```
Scan QR code with Expo Go app on your phone.

### Step 4: Build for Production

#### Using Expo Build (Classic)
```bash
# Login to Expo
expo login

# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

#### Using EAS Build (Recommended)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Step 5: Download Build
- Expo will provide a download link
- For Android: `.apk` file
- For iOS: TestFlight link

---

## 5. Environment Configuration

### Complete Environment Setup

#### Backend Environment Variables
```bash
# Database
DB_HOST=your-project.supabase.co
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-secure-password
DB_PORT=5432

# Security
JWT_SECRET=your-super-secret-key-at-least-32-characters-long

# Optional: Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Mobile App Configuration
Edit `src/services/api.js`:
```javascript
// Production
export const API_URL = 'https://smartfarm-api.onrender.com/api';

// Development (local)
// export const API_URL = 'http://localhost:8000/api';
```

#### Admin Panel Configuration
Edit `app.js`:
```javascript
const API_URL = 'https://smartfarm-api.onrender.com/api';
```

---

## 🔒 Security Checklist

- [ ] Change default JWT secret
- [ ] Use strong database password
- [ ] Enable SSL/HTTPS on all services
- [ ] Set up CORS properly
- [ ] Configure rate limiting
- [ ] Enable request logging
- [ ] Set up backup schedule for database

---

## 🐛 Troubleshooting

### Database Connection Issues
1. Check if Supabase project is active
2. Verify connection string format
3. Ensure IP is not blocked
4. Check if database is paused (free tier)

### Backend Not Responding
1. Check Render logs
2. Verify environment variables
3. Check if `.htaccess` is properly uploaded
4. Ensure PHP version is 8.0+

### Mobile App Can't Connect
1. Verify API_URL is correct
2. Check if backend is accessible
3. Ensure device and backend are on same network (local testing)
4. Check CORS configuration

### Admin Panel Not Loading Data
1. Check browser console for errors
2. Verify API_URL in app.js
3. Check if backend is responding
4. Verify admin user has proper role

---

## 📈 Scaling

### Database (Supabase)
- Free tier: 500MB database, 2GB bandwidth
- Pro tier: 8GB database, 100GB bandwidth
- Can scale automatically

### Backend (Render)
- Free tier: 512MB RAM, sleeps after 15 min
- Starter: 512MB RAM, always on
- Can scale vertically

### Admin Panel (Vercel)
- Free tier: 100GB bandwidth
- Pro tier: 1TB bandwidth
- Edge network for fast loading

---

## 📝 Post-Deployment Tasks

1. **Create Admin User**
   - Register a user through the mobile app
   - Manually update role to 'admin' in database
   - Or use API to create admin user

2. **Test All Features**
   - User registration/login
   - Crop creation (farmer)
   - Order placement (buyer)
   - Admin panel access

3. **Set Up Monitoring**
   - Render has built-in logs
   - Supabase has query statistics
   - Consider adding error tracking (Sentry)

4. **Configure Backups**
   - Supabase has daily backups
   - Can restore to any point in time

---

## 🎉 You're Live!

Your SmartFarm platform is now deployed and ready to use!

- **Mobile App**: Download from Expo or app stores
- **Backend API**: `https://your-render-url.onrender.com/api`
- **Admin Panel**: `https://your-vercel-url.vercel.app`
- **Database**: Managed on Supabase

For support, refer to the README.md or contact the development team.
