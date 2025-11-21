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
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Catch all other routes and serve index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 MENDLINK Server running on port ${PORT}`);
  console.log(`📱 Expo QR: https://localhost:${PORT}/expo-qr`);
  console.log(`🌐 Web App: https://localhost:${PORT}`);
  console.log(`📊 Health: https://localhost:${PORT}/health`);
});
