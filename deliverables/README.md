# SmartFarm Project Deliverables

This project contains a full-stack implementation of the SmartFarm platform.

## 1. Web Application (Live Preview)
The live preview running in this environment is a high-fidelity web version (PWA) built with:
- **Frontend:** React 19, TypeScript, Tailwind CSS (Neon Green Theme)
- **Backend:** Node.js Express (REST API)
- **Database:** PostgreSQL (on Render)
- **AI:** Gemini 3 Flash for Crop Disease Detection

## 2. Mobile Application (Flutter)
Located in `/deliverables/mobile/`
- **Framework:** Flutter
- **State Management:** Provider
- **Features:** Role-based login, Marketplace, Camera integration for crop health.
- **To Run:** 
  1. Install Flutter SDK.
  2. Run `flutter pub get`.
  3. Update API URL in `main.dart`.
  4. Run `flutter run`.

## 3. Backend API (PHP)
Located in `/deliverables/backend/`
- **Language:** PHP 8.x
- **Database:** PostgreSQL (PDO)
- **Features:** JWT Auth, Marketplace endpoints, Admin stats.
- **To Host on Render:**
  1. Create a new Web Service on Render.
  2. Select the PHP environment.
  3. Connect your GitHub repo.
  4. Set environment variables for DB connection.

## 4. Database (PostgreSQL)
- **Schema:** Located in `/schema.sql`.
- **Initialization:** Run `npm run init-db` in this environment to apply the schema to your Render database.

## 5. Admin Credentials
- **Email:** `admin@smartfarm.com`
- **Password:** `admin123`

---
Developed by Senior Full-Stack Developer & Flutter Expert.
