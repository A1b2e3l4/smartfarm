# SmartFarm Deployment Guide

This guide explains how to deploy the SmartFarm platform to GitHub, Render, and how to get an APK for your phone.

## 1. Adding to GitHub

1.  **Initialize Git:**
    ```bash
    git init
    ```
2.  **Add all files:**
    ```bash
    git add .
    ```
3.  **Commit changes:**
    ```bash
    git commit -m "Initial commit of SmartFarm platform"
    ```
4.  **Create a new repository on GitHub.**
5.  **Link your local repo to GitHub:**
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/smartfarm.git
    ```
6.  **Push to GitHub:**
    ```bash
    git push -u origin main
    ```

## 2. Deploying to Render

1.  **Create a Render Account:** Go to [render.com](https://render.com) and sign up.
2.  **Create a New Web Service:**
    *   Click **New +** and select **Web Service**.
    *   Connect your GitHub repository.
3.  **Configure the Service:**
    *   **Name:** `smartfarm`
    *   **Runtime:** `Docker`
    *   **Plan:** `Free` (or as needed)
4.  **Environment Variables:**
    Add the following variables in the Render dashboard:
    *   `DATABASE_URL`: Your PostgreSQL connection string (Render provides managed PostgreSQL).
    *   `GEMINI_API_KEY`: Your Google Gemini API key.
    *   `JWT_SECRET`: A random string for securing logins.
    *   `NODE_ENV`: `production`
5.  **Deploy:** Render will automatically build the Docker image and deploy your app.

## 3. Getting an APK for Your Phone

Since SmartFarm is a **Progressive Web App (PWA)**, you don't necessarily need a traditional APK. You can "install" it directly from your browser.

### Option A: Install as PWA (Recommended)
1.  Open your deployed Render URL in **Google Chrome** on your Android phone.
2.  Tap the **three dots (menu)** in the top right corner.
3.  Select **"Add to Home screen"** or **"Install app"**.
4.  The SmartFarm icon will now appear on your home screen like a native app.

### Option B: Create an APK using Capacitor
If you strictly need an `.apk` file:
1.  **Install Capacitor:**
    ```bash
    npm install @capacitor/core @capacitor/cli @capacitor/android
    ```
2.  **Initialize Capacitor:**
    ```bash
    npx cap init SmartFarm com.smartfarm.app --web-dir dist
    ```
3.  **Add Android Platform:**
    ```bash
    npx cap add android
    ```
4.  **Copy Build Files:**
    ```bash
    npm run build
    npx cap copy
    ```
5.  **Open in Android Studio:**
    ```bash
    npx cap open android
    ```
6.  In Android Studio, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
7.  Once finished, you can find the APK in `android/app/build/outputs/apk/debug/app-debug.apk`.
