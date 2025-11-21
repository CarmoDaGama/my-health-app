#!/bin/bash

# MENDLINK - Deploy to Render Script
# This script builds the app for Render deployment with Expo Go compatibility

set -e  # Exit on any error

echo "🚀 MENDLINK - Starting Render Deployment Process..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Step 1: Installing dependencies...${NC}"
npm install

echo -e "${BLUE}📱 Step 2: Exporting for web (Expo Go compatible)...${NC}"
npx expo export --platform web --clear

echo -e "${BLUE}🌐 Step 3: Creating additional web assets...${NC}"
# Create web-specific optimizations if needed
if [ ! -d "dist" ]; then
    mkdir -p dist
fi

echo -e "${BLUE}📄 Step 4: Creating deployment files...${NC}"

# Create QR code page for easy Expo Go access
cat > dist/expo-qr.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MENDLINK - Open in Expo Go</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #2E7D32, #4CAF50);
            color: white;
            text-align: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        h1 {
            margin: 0 0 20px 0;
            font-size: 2.5em;
            font-weight: 700;
        }
        .subtitle {
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .qr-container {
            background: white;
            padding: 20px;
            border-radius: 15px;
            margin: 30px 0;
            display: inline-block;
        }
        .instructions {
            max-width: 400px;
            margin: 20px auto;
            font-size: 1.1em;
            line-height: 1.6;
        }
        .step {
            margin: 15px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            border-left: 4px solid #FFF;
        }
        .url-box {
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            font-family: monospace;
            word-break: break-all;
        }
        .button {
            display: inline-block;
            padding: 15px 30px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            margin: 10px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
        }
        .button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 MENDLINK</h1>
        <div class="subtitle">Healthcare Services Platform</div>
        
        <div class="qr-container">
            <div id="qrcode" style="width: 256px; height: 256px; margin: 0 auto;">
                <!-- QR Code will be generated here -->
                <svg width="256" height="256" viewBox="0 0 256 256">
                    <rect width="256" height="256" fill="white"/>
                    <text x="128" y="128" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">
                        QR Code will be generated
                        <tspan x="128" dy="20">when deployed to Render</tspan>
                    </text>
                </svg>
            </div>
        </div>
        
        <div class="instructions">
            <div class="step">
                <strong>1.</strong> Install Expo Go app on your mobile device
            </div>
            <div class="step">
                <strong>2.</strong> Scan the QR code above with Expo Go
            </div>
            <div class="step">
                <strong>3.</strong> Or use the direct URL below
            </div>
        </div>
        
        <div class="url-box">
            <strong>Direct URL:</strong><br>
            <span id="expo-url">Will be updated after Render deployment</span>
        </div>
        
        <a href="/" class="button">🌐 Open Web Version</a>
        <a href="https://expo.dev/go" class="button">📱 Download Expo Go</a>
    </div>

    <script>
        // Update URLs when page loads
        window.addEventListener('load', function() {
            const currentUrl = window.location.origin;
            const expoUrl = `exp://${window.location.hostname}`;
            document.getElementById('expo-url').textContent = expoUrl;
            
            // You can integrate QR code generation library here
            // For now, we'll show the URL
        });
    </script>
</body>
</html>
EOF

echo -e "${BLUE}🔧 Step 5: Creating server configuration...${NC}"

# Create simple server for development builds
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
app.use(express.static('dist'));

// API endpoint to get app info
app.get('/api/app-info', (req, res) => {
  const appInfo = {
    name: 'MENDLINK',
    version: '1.0.0',
    expoUrl: `exp://${req.get('host')}`,
    webUrl: `https://${req.get('host')}`,
    platform: 'Expo Go Compatible'
  };
  res.json(appInfo);
});

// Expo Go compatibility endpoint
app.get('/manifest', (req, res) => {
  res.json({
    name: 'MENDLINK',
    slug: 'mendlink-app',
    version: '1.0.0',
    platforms: ['web'],
    bundleUrl: `https://${req.get('host')}/static/js/app.bundle.js`,
    debuggerHost: `${req.get('host')}:${PORT}`,
    expoServerPort: PORT,
    packagerOpts: {
      dev: false
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'MENDLINK Render Deployment'
  });
});

// Serve QR code page
app.get('/expo-qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'expo-qr.html'));
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MENDLINK Server running on port ${PORT}`);
  console.log(`📱 Expo QR: https://localhost:${PORT}/expo-qr`);
  console.log(`🌐 Web App: https://localhost:${PORT}`);
  console.log(`📊 Health: https://localhost:${PORT}/health`);
});
EOF

echo -e "${BLUE}📋 Step 6: Adding server dependencies...${NC}"
if ! grep -q '"express"' package.json; then
    npm install --save express
fi

echo -e "${BLUE}📝 Step 7: Creating Render configuration...${NC}"

# Create render.yaml for automatic deployment
cat > render.yaml << 'EOF'
services:
  - type: web
    name: mendlink-health-app
    env: node
    plan: free
    region: oregon
    buildCommand: npm run render-build && node -e "console.log('Build completed successfully')"
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: EXPO_USE_FAST_REFRESH
        value: false
      - key: EXPO_USE_METRO_WORKSPACE_ROOT
        value: true
    domains:
      - mendlink-health-app.onrender.com
    healthCheckPath: /health
EOF

echo -e "${BLUE}📄 Step 8: Creating deployment instructions...${NC}"

cat > RENDER_DEPLOYMENT.md << 'EOF'
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
EOF

echo -e "${GREEN}✅ Deployment files created successfully!${NC}"
echo -e "${GREEN}📋 Next steps:${NC}"
echo -e "${YELLOW}   1. Commit all changes to Git${NC}"
echo -e "${YELLOW}   2. Push to your GitHub repository${NC}"
echo -e "${YELLOW}   3. Connect repository to Render${NC}"
echo -e "${YELLOW}   4. Configure as Web Service with Node environment${NC}"
echo -e "${YELLOW}   5. Use build command: npm run render-build${NC}"
echo -e "${YELLOW}   6. Use start command: node server.js${NC}"
echo -e "${YELLOW}   7. Access via: https://your-app.onrender.com/expo-qr${NC}"

echo ""
echo -e "${BLUE}📚 Read RENDER_DEPLOYMENT.md for detailed instructions${NC}"
echo -e "${GREEN}🚀 MENDLINK Render deployment setup completed!${NC}"