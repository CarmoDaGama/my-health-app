const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable trust proxy for proper host detection
app.set('trust proxy', true);

// Serve static files from dist directory
app.use(express.static('dist'));

// API endpoint to get app info
app.get('/api/app-info', (req, res) => {
  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || 'https';
  
  const appInfo = {
    name: 'MENDLINK',
    version: '1.0.0',
    expoUrl: `${protocol}://${host}`,
    webUrl: `${protocol}://${host}`,
    platform: 'Expo Go Compatible'
  };
  res.json(appInfo);
});

// Expo Go compatibility endpoints
app.get('/manifest', (req, res) => {
  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || 'https';
  
  const manifest = {
    id: '@carmodagama/mendlink-app',
    name: 'MENDLINK',
    slug: 'mendlink-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: `${protocol}://${host}/icon.png`,
    userInterfaceStyle: 'light',
    splash: {
      image: `${protocol}://${host}/splash.png`,
      resizeMode: 'contain',
      backgroundColor: '#2E7D32'
    },
    platforms: ['web', 'ios', 'android'],
    bundleUrl: `${protocol}://${host}/_expo/static/js/web/index.js`,
    debuggerHost: host,
    hostUri: host,
    mainModuleName: 'index',
    logUrl: `${protocol}://${host}/logs`,
    developer: {
      tool: 'expo-cli',
      projectRoot: '/app'
    },
    packagerOpts: {
      dev: false,
      minify: true
    },
    env: {},
    sdkVersion: '49.0.0',
    updates: {
      enabled: false
    }
  };
  
  res.json(manifest);
});

// Expo development manifest (alternative endpoint)
app.get('/--/manifest', (req, res) => {
  const host = req.get('host');
  const protocol = req.get('x-forwarded-proto') || 'https';
  
  res.json({
    manifestString: JSON.stringify({
      id: '@carmodagama/mendlink-app',
      name: 'MENDLINK',
      slug: 'mendlink-app',
      version: '1.0.0',
      bundleUrl: `${protocol}://${host}/_expo/static/js/web/index.js`,
      platform: 'web'
    }),
    signature: 'UNSIGNED'
  });
});

// Expo status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    packager: 'running',
    expoServerRunning: true
  });
});

// Expo logs endpoint (required by some Expo Go versions)
app.get('/logs', (req, res) => {
  res.json({ logs: [] });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'MENDLINK Render Deployment',
    expo: 'compatible'
  });
});

// Serve QR code page
app.get('/expo-qr', (req, res) => {
  const qrPath = path.join(__dirname, 'dist', 'expo-qr.html');
  if (fs.existsSync(qrPath)) {
    res.sendFile(qrPath);
  } else {
    res.status(404).send('QR page not found');
  }
});

// Serve root index
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App not found');
  }
});

// Fallback middleware for SPA routing (must be last)
app.use((req, res, next) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: 'Not found',
      message: 'The requested resource was not found',
      path: req.path
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 MENDLINK Server running on port ${PORT}`);
  console.log(`📱 Expo QR: http://localhost:${PORT}/expo-qr`);
  console.log(`🌐 Web App: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`📋 Manifest: http://localhost:${PORT}/manifest`);
  console.log(`⚡ Status: http://localhost:${PORT}/status`);
});
