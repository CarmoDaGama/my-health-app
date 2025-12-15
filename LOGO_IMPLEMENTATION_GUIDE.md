# 🎨 MENDLINK Logo Implementation Guide

## Current Status
The app currently uses placeholder images for branding. This guide provides instructions for adding custom logos.

---

## 📁 Files That Need Logo Assets

### 1. **App Icon** (`./assets/icon.png`)
- **Size:** 1024x1024 px
- **Format:** PNG with transparency
- **Purpose:** App icon on device home screen
- **Design:** MENDLINK logo with background

### 2. **Splash Screen** (`./assets/splash-icon.png`)
- **Size:** 1242x2436 px (or larger)
- **Format:** PNG
- **Purpose:** Loading screen when app opens
- **Design:** MENDLINK logo centered on colored background

### 3. **Adaptive Icon** (`./assets/adaptive-icon.png`)
- **Size:** 1024x1024 px
- **Format:** PNG with transparency
- **Purpose:** Android adaptive icon (foreground layer)
- **Design:** MENDLINK logo without background (transparent)

### 4. **Favicon** (`./assets/favicon.png`)
- **Size:** 48x48 px
- **Format:** PNG
- **Purpose:** Web version browser tab icon
- **Design:** Simplified MENDLINK logo

---

## 🎨 Design Recommendations

### Brand Colors (from your app)
```typescript
Primary: #3B82F6 (Blue)
Secondary: #10B981 (Green)
Accent: #F59E0B (Orange)
Background: #F5F5F5 (Light Gray)
```

### Logo Concepts
1. **Medical Cross + Technology**
   - Combine a medical cross with a digital/tech element
   - Shows healthcare + modern technology

2. **Heart + Location Pin**
   - Heart shape merged with a location pin
   - Represents finding healthcare services

3. **Stylized "M" for MENDLINK**
   - Modern, geometric "M" lettermark
   - Clean and professional

### Typography
- Use clean, modern sans-serif fonts
- Consider: **Inter**, **Poppins**, **Montserrat**, or **Raleway**

---

## 🔧 Implementation Steps

### Step 1: Design the Logo
Using design tools like:
- **Figma** (recommended - free)
- **Adobe Illustrator**
- **Canva** (easiest for non-designers)
- **Inkscape** (free alternative)

### Step 2: Export Assets
Export in the following sizes:

```
icon.png           → 1024x1024px
splash-icon.png    → 1242x2436px
adaptive-icon.png  → 1024x1024px
favicon.png        → 48x48px
```

### Step 3: Replace Files
1. Place your exported images in `/assets/` folder
2. Ensure filenames match exactly:
   - `icon.png`
   - `splash-icon.png`
   - `adaptive-icon.png`
   - `favicon.png`

### Step 4: Update app.json (if needed)
Current configuration in `app.json`:
```json
{
  "icon": "./assets/icon.png",
  "splash": {
    "image": "./assets/splash-icon.png",
    "resizeMode": "contain",
    "backgroundColor": "#3B82F6"
  },
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#ffffff"
    }
  },
  "web": {
    "favicon": "./assets/favicon.png"
  }
}
```

You can customize:
- `splash.backgroundColor` - Color behind logo on splash screen
- `android.adaptiveIcon.backgroundColor` - Background color for Android icon

### Step 5: Add Logo to Header (Optional)
To add logo to the app header instead of just "MENDLINK" text:

**Option A: Replace text with logo image**
```tsx
// In navigation/MainTabNavigator.tsx
<Tab.Screen
  name="Home"
  component={HomeScreen}
  options={{
    headerTitle: () => (
      <Image 
        source={require('../assets/logo-header.png')} 
        style={{ width: 120, height: 40 }}
        resizeMode="contain"
      />
    ),
  }}
/>
```

**Option B: Logo + Text combination**
```tsx
headerTitle: () => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Image 
      source={require('../assets/logo-icon-small.png')} 
      style={{ width: 32, height: 32, marginRight: 8 }}
      resizeMode="contain"
    />
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.primary }}>
      MENDLINK
    </Text>
  </View>
),
```

---

## 🚀 Quick Start with Placeholder

If you need a temporary logo while designing:

### 1. Use Text-Based Logo Generator
- Visit: https://www.freelogodesign.org/
- Enter: "MENDLINK"
- Choose healthcare/medical category
- Export and use temporarily

### 2. Use Icon Libraries
Create simple icon using:
- **Ionicons**: Already installed
- Create colored circle with "M" letter
- Use medical cross icon

Example code for temporary header logo:
```tsx
import { Ionicons } from '@expo/vector-icons';

headerTitle: () => (
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={{ 
      width: 32, 
      height: 32, 
      borderRadius: 16, 
      backgroundColor: Colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8
    }}>
      <Ionicons name="medical" size={20} color="white" />
    </View>
    <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors.text }}>
      MENDLINK
    </Text>
  </View>
),
```

---

## ✅ Testing Your Logo

After adding logo files:

1. **Clear cache and rebuild:**
   ```bash
   npx expo start --clear
   ```

2. **Test on multiple devices:**
   - iOS (different screen sizes)
   - Android (different manufacturers)
   - Web browser

3. **Check visibility:**
   - Light mode
   - Dark mode (if supported)
   - Small screen sizes
   - Large screen sizes

---

## 📝 Checklist

- [ ] Design logo concept
- [ ] Create 1024x1024 app icon
- [ ] Create 1242x2436 splash screen
- [ ] Create 1024x1024 adaptive icon
- [ ] Create 48x48 favicon
- [ ] Place files in `/assets/` folder
- [ ] Test on iOS simulator/device
- [ ] Test on Android emulator/device
- [ ] Test on web browser
- [ ] (Optional) Add logo to app header
- [ ] (Optional) Add logo to login screen
- [ ] (Optional) Add logo to profile screen

---

## 🎯 Priority

**Low Priority** - This is cosmetic and doesn't affect functionality. Focus on:
1. Functionality working correctly
2. All features implemented
3. Testing completed
4. Then add branding/logo

---

## 💡 Tips

- Keep it simple - complex logos don't scale well to small sizes
- Ensure good contrast for visibility
- Use SVG for scalability (convert to PNG for app assets)
- Test logo readability at 32x32px (smallest visible size)
- Consider color-blind users - don't rely solely on color

---

**For professional logo design**, consider hiring a designer on:
- Fiverr ($10-50)
- 99designs
- Upwork
- Local design agencies

**Total estimated time:** 2-4 hours (DIY) or 2-3 days (professional designer)
