# MENDLINK - Render Deployment Guide

## 🚀 Deployment Status
This project is configured for Render deployment with Expo Go compatibility.

## 📱 How to Access via Expo Go

### Option 1: QR Code (Recommended)
1. Visit: `https://your-render-url.onrender.com/expo-qr`
2. Scan the QR code with Expo Go app
3. App will load directly in Expo Go

### Option 2: Direct URL
1. Open Expo Go app
2. Enter URL: `exp://your-render-url.onrender.com`
3. App will load directly

### Option 3: Web Browser
1. Visit: `https://your-render-url.onrender.com`
2. Use the web version directly

## 🔧 Render Configuration

### Build Command:
```bash
npm run render-build
```

### Start Command:
```bash
node server.js
```

### Environment Variables:
- `NODE_ENV=production`
- `EXPO_USE_FAST_REFRESH=false`
- `EXPO_USE_METRO_WORKSPACE_ROOT=true`

## 📋 Deployment Steps

1. **Connect Repository**
   - Connect your GitHub repo to Render
   - Select the `master` branch

2. **Configure Service**
   - Service Type: Web Service
   - Environment: Node
   - Build Command: `npm run render-build`
   - Start Command: `node server.js`

3. **Set Environment Variables**
   ```
   NODE_ENV=production
   EXPO_USE_FAST_REFRESH=false
   EXPO_USE_METRO_WORKSPACE_ROOT=true
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment

## 🔗 Important URLs

After deployment, you'll have:
- **Web App**: `https://your-app.onrender.com`
- **Expo QR**: `https://your-app.onrender.com/expo-qr`
- **API Health**: `https://your-app.onrender.com/health`
- **App Manifest**: `https://your-app.onrender.com/manifest`

## 📱 Expo Go Setup

1. **Install Expo Go**
   - iOS: App Store
   - Android: Google Play Store

2. **Open App**
   - Scan QR code from `/expo-qr` page
   - Or enter direct URL in Expo Go

## 🐛 Troubleshooting

### App doesn't load in Expo Go:
- Check if URL is accessible in browser
- Verify manifest endpoint: `/manifest`
- Check Render logs for errors

### Build fails:
- Check Node.js version (should be 18.19.0)
- Verify all dependencies are installed
- Check Render build logs

### Performance issues:
- Web version may be slower than native
- Some native features might be limited
- Consider building native APK for better performance

## 🔄 Auto-Deploy

This project is configured for auto-deploy on Git push:
```bash
git add .
git commit -m "Update app"
git push origin master
```

Render will automatically rebuild and deploy.
