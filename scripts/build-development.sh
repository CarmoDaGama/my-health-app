#!/bin/bash

# MENDLINK - EAS Build Script for Development
# This script builds a development APK that can be distributed via Render

set -e

echo "🏗️ MENDLINK - Building Development APK..."
echo "=========================================="

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
fi

# Login check
echo "🔐 Checking EAS authentication..."
if ! eas whoami &> /dev/null; then
    echo "❌ Please login to EAS first:"
    echo "   eas login"
    exit 1
fi

echo "✅ EAS authentication verified"

# Build development APK
echo "📱 Building development APK..."
eas build --platform android --profile development --local

echo "✅ Development build completed!"
echo ""
echo "📋 Next steps:"
echo "   1. Upload the generated APK to a file hosting service"
echo "   2. Create a download link on your Render deployment"
echo "   3. Users can install the APK directly on their devices"
echo ""
echo "💡 Tip: The APK will be in the current directory"
echo "   Look for: mendlink-app-*.apk"