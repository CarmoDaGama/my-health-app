# 📋 ANALYSIS: International User Issues - MENDLINK App

**Date:** December 15, 2025  
**Analyst:** GitHub Copilot  
**Project:** my-health-app (MENDLINK)

---

## 🎯 Executive Summary

This document analyzes the user-reported issues regarding the internationalization and usability of the MENDLINK healthcare application. The analysis identifies 14 distinct issues across localization, registration flow, UI/UX, and feature accessibility.

---

## 📊 Issues Analysis

### 1. ⚠️ **Portuguese Text Still Present**
**Priority:** HIGH  
**Status:** PARTIALLY RESOLVED

**Current State:**
- The app has comprehensive i18n implementation with English and Portuguese translations
- Translation files exist in `utils/i18n.ts` with 1700+ lines of translations
- However, some hardcoded Portuguese strings still exist in the codebase

**Problem Areas:**
```typescript
// File: components/specific/ServiceReviews.tsx (Lines 370-380)
// Hardcoded Portuguese text:
<Text style={styles.loadingText}>Carregando avaliações...</Text>
<Text style={styles.categoryStatCount}>{stat.reviewCount} avaliações</Text>

// File: components/auth/InstitutionForm.tsx
// AVAILABLE_SERVICES array has Portuguese strings:
const AVAILABLE_SERVICES = [
  'Emergência',  // Should use t('medicalServices.emergency')
  'Cirurgia',    // Should use t('medicalServices.surgery')
  // ... etc
];
```

**Files Requiring Updates:**
- `components/specific/ServiceReviews.tsx`
- `components/auth/InstitutionForm.tsx`
- `components/auth/ProfessionalForm.tsx`
- Any error messages in catch blocks

**Recommendation:**
Replace all hardcoded Portuguese strings with translation keys using the `useTranslation()` hook.

---

### 2. 🌍 **Location Restricted to Angola**
**Priority:** CRITICAL  
**Status:** RESOLVED (with caveats)

**Current State:**
- International validation system implemented in `utils/validation.ts`
- Supports 11 countries: Angola, Brazil, Portugal, USA, UK, France, Spain, Mozambique, Cape Verde, Republic of Congo, DR Congo
- Country configuration in `utils/countries.ts`

**Problem:**
- Error messages still appear in Portuguese
- Location picker may still have Angola-centric defaults
- Address validation needs better international support

**Files:**
- ✅ `utils/countries.ts` - International country configs
- ✅ `utils/validation.ts` - `validateInternationalCoordinates()`
- ⚠️ `components/common/LocationPicker.tsx` - Needs verification
- ⚠️ Error messages in Portuguese when validation fails

**Recommendation:**
- Update error messages to use i18n translations
- Make country selection visible in location picker
- Add country auto-detection from coordinates

---

### 3. ❌ **Cannot Register Institution**
**Priority:** CRITICAL  
**Status:** REQUIRES INVESTIGATION

**Current State:**
- Institution registration form exists in `components/auth/InstitutionForm.tsx`
- Form includes: type, address, services, coordinates
- Registration flow goes through `screens/RegisterScreen.tsx`

**Potential Issues:**
1. **Form Validation Too Strict:**
   ```typescript
   // RegisterScreen.tsx Lines 135-144
   if (formData.userType === UserType.INSTITUTION) {
     if (!formData.institutionInfo?.type) {
       newErrors.type = t('validation.institutionTypeRequired');
     }
     if (!formData.institutionInfo?.address) {
       newErrors.address = t('validation.addressRequired');
     }
     if (!formData.institutionInfo?.city) {
       newErrors.city = t('validation.cityRequired');
     }
   }
   ```

2. **Nested Field Updates:**
   - Complex nested field handling in `handleFieldChange()` (Lines 47-90)
   - May have issues with `institutionInfo.address.street` type structures

3. **Coordinate Validation:**
   - May fail for non-Angolan coordinates
   - Geocoding service may return errors

**Recommendation:**
- Test complete institution registration flow
- Log all validation errors
- Verify coordinate validation accepts international locations
- Check Firebase write permissions for institutions

---

### 4. 📱 **Phone Numbers are Angolan Type Only**
**Priority:** HIGH  
**Status:** PARTIALLY RESOLVED

**Current State:**
```typescript
// RegisterScreen.tsx Lines 113-117
const isValidAngolanPhone = (phone: string): boolean => {
  // Formato angolano: +244 9xx xxx xxx ou 9xx xxx xxx
  const phoneRegex = /^(\+244\s?)?9[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};
```

**Problem:**
- Hardcoded Angolan phone validation in RegisterScreen
- International phone validation exists but not used: `validateInternationalPhone()`

**Solution Available:**
```typescript
// utils/validation.ts - Already implemented but not used!
export const validateInternationalPhone = (
  phone: string,
  countryCode?: string
): PhoneValidationResult => {
  // Supports +244, +55, +351, +1, +44, +33, +34, +258, +238, +242, +243
  // ...
}
```

**Recommendation:**
Replace `isValidAngolanPhone()` with `validateInternationalPhone()` in RegisterScreen.

---

### 5. 📝 **Form Label: "Full name" instead of "Your full name"**
**Priority:** LOW  
**Status:** REQUIRES CHANGE

**Current State:**
```typescript
// utils/i18n.ts
en: {
  auth: {
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your full name',
  }
}

// RegisterScreen.tsx Line 246
label={t('auth.fullName')}  // Shows "Full Name"
placeholder={t('auth.fullNamePlaceholder')}  // Shows "Your full name"
```

**Issue:**
- User expects "Your full name" as label, not placeholder
- Current label is impersonal

**Recommendation:**
Either:
- Change translation key `auth.fullName` to "Your Full Name"
- Or swap label to use placeholder text: `label={t('auth.fullNamePlaceholder')}`

---

### 6. 📧 **Email Verification**
**Priority:** MEDIUM  
**Status:** IMPLEMENTED BUT NOT CLEAR

**Current State:**
- Email verification screen exists: `screens/EmailVerificationScreen.tsx` (implied from navigation types)
- Navigation after registration:
  ```typescript
  // RegisterScreen.tsx Lines 171-172
  navigation.navigate('EmailVerification', { email: formData.email });
  ```

**Issue:**
- User reports confusion about email verification
- May not be clear that verification is required
- Resend functionality might not work

**Files to Check:**
- Email verification flow implementation
- Firebase email verification service
- UI clarity on verification requirement

**Recommendation:**
- Add clearer messaging during registration about email verification
- Test email verification resend functionality
- Add visual indicator showing verification status

---

### 7. ❌ **Can't Add Institution** (Duplicate of #3)
**Priority:** CRITICAL  
**Status:** See Issue #3

---

### 8. 📍 **Menu Bar Too Far Down**
**Priority:** MEDIUM  
**Status:** REQUIRES UI ADJUSTMENT

**Current State:**
```typescript
// navigation/MainTabNavigator.tsx Lines 44-59
tabBarStyle: {
  backgroundColor: Colors.surface,
  borderTopWidth: 0,
  height: 70,
  paddingBottom: 10,
  paddingTop: 8,
  paddingHorizontal: 16,
  ...shadows.neumorphic.medium,
  borderRadius: 20,
  marginHorizontal: 16,
  marginBottom: 16,  // ⚠️ This pushes it up from bottom
  position: 'absolute',
  bottom: 0,
}
```

**Issue:**
- Tab bar positioned with `marginBottom: 16` which may feel too low on some devices
- On devices with notches/gesture bars, might be too close to edge
- The draggable search bar may conflict with tab positioning

**Recommendation:**
- Adjust `marginBottom` to `8` or use SafeAreaView insets
- Test on devices with different screen sizes
- Ensure tab bar doesn't overlap with content

---

### 9. 💬 **Review Section: Can't See Comment Box**
**Priority:** HIGH  
**Status:** LAYOUT ISSUE

**Current State:**
```typescript
// components/specific/ServiceReviews.tsx
// The review form is triggered by onWriteReview callback
// The actual form might be in a modal or separate screen
```

**Potential Issues:**
1. **Modal/Keyboard Overlap:**
   - Comment input field might be hidden by keyboard
   - Modal might not scroll properly
   - KeyboardAvoidingView not configured

2. **Navigation Issue:**
   - Comment form might be on separate screen but navigation fails
   - Form might not be rendering at all

**Recommendation:**
- Find the review submission form/modal
- Add KeyboardAvoidingView wrapper
- Ensure form is scrollable
- Test keyboard behavior on both iOS and Android

---

### 10. 🔍 **Review Section: Nothing Visible / Can't See Anything**
**Priority:** HIGH  
**Status:** DATA OR RENDERING ISSUE

**Current State:**
```typescript
// components/specific/ServiceReviews.tsx Lines 294-430
export const ServiceReviews: React.FC<ServiceReviewsProps> = ({
  service,
  onWriteReview,
}) => {
  // ... loads reviews from ThematicReviewService
  // Shows empty state if no reviews
}
```

**Possible Causes:**
1. **No Data in Database:**
   - Reviews might not exist for the service
   - Firestore query might be filtering out all reviews

2. **Rendering Issue:**
   - Empty state shows but user expects something else
   - Loading state never completes
   - Colors/styling makes content invisible (white on white)

3. **Permissions:**
   - Firestore rules might block reading reviews
   - User might not have permission to view

**Current Empty State:**
```typescript
// Lines 410-423
<View style={styles.emptyState}>
  <Ionicons name="chatbubbles-outline" size={48} color={Colors.textSecondary} />
  <Text style={styles.emptyStateTitle}>No reviews yet</Text>
  <Text style={styles.emptyStateText}>
    Be the first to rate this service and help other users!
  </Text>
</View>
```

**Recommendation:**
- Verify Firestore rules allow reading reviews
- Add better loading/error states
- Log review data loading process
- Check if color scheme makes text invisible

---

### 11. 🎨 **Add a Logo**
**Priority:** LOW  
**Status:** DESIGN TASK

**Current State:**
- App uses "MENDLINK" text as header (MainTabNavigator.tsx Line 95)
- No visual logo present in tab bar or header
- Splash screen has logo container but content unknown

**Recommendation:**
- Design app logo/icon
- Add logo to:
  - App header (replace or accompany "MENDLINK" text)
  - Splash screen
  - App icon (app.json configuration)
  - Login/Register screens

---

### 12. 🚫 **Remove License Number (for Caregivers)**
**Priority:** MEDIUM  
**Status:** REQUIRES CONDITIONAL LOGIC

**Current State:**
```typescript
// components/auth/ProfessionalForm.tsx Lines 119-126
<ValidatedInput
  label={t('forms.licenseNumber') || 'Número da Licença'}
  value={data.license || ''}
  onChangeText={(value) => onChange('license', value)}
  error={errors.license}
  placeholder={t('forms.licenseNumberPlaceholder')}
  required  // ⚠️ Always required!
/>
```

**Issue:**
- License number is always required for professionals
- Caregivers may not have professional licenses
- Need to differentiate between licensed professionals and caregivers

**Recommendation:**
- Add "Caregiver" as a separate professional type or specialty
- Make license field conditional:
  ```typescript
  required={data.specialty !== 'Caregiver'}
  ```
- Update validation logic in RegisterScreen.tsx

---

### 13. 🏥 **Available Services: Add "Caregiver"**
**Priority:** MEDIUM  
**Status:** REQUIRES ADDITION

**Current State:**
```typescript
// components/auth/ProfessionalForm.tsx
// Uses getTranslatedServices() from constants/specialties.ts
// Needs "Caregiver" added to the list
```

**Recommendation:**
- Add to `i18n.ts`:
  ```typescript
  medicalServices: {
    caregiver: 'Caregiver',
    caregiving: 'Caregiving',
    // ...
  }
  ```
- Add to available services in forms
- Update service type filtering logic

---

### 14. 📍 **Remove "Exact Location" for Professionals**
**Priority:** MEDIUM  
**STATUS:** REQUIRES CONDITIONAL RENDERING

**Current State:**
```typescript
// components/auth/ProfessionalForm.tsx Lines 198-200
<View style={styles.coordinatesSection}>
  <Text style={styles.label}>{t('forms.exactLocation')}</Text>
  // ... GPS and map pickers
</View>
```

**Issue:**
- Some professionals (like caregivers) may not want to share exact location
- Privacy concern for home-based professionals
- Should be optional, not required

**Recommendation:**
- Make exact location optional for professionals
- Add privacy note explaining why location is requested
- Allow professionals to show approximate location (neighborhood/city) only

---

### 15. 🏢 **Institution Type: Add "Care Giving Agency"**
**Priority:** MEDIUM  
**Status:** REQUIRES ADDITION

**Current State:**
```typescript
// components/auth/InstitutionForm.tsx Lines 80-87
const getInstitutionTypes = () => [
  { label: t('forms.selectType'), value: '' },
  { label: t('serviceTypes.types.hospital'), value: 'hospital' },
  { label: t('serviceTypes.types.clinic'), value: 'clinic' },
  { label: t('serviceTypes.types.laboratory'), value: 'laboratory' },
  { label: t('serviceTypes.types.pharmacy'), value: 'pharmacy' },
  { label: t('common.other'), value: 'other' },
];
```

**Recommendation:**
- Add to `i18n.ts`:
  ```typescript
  serviceTypes: {
    types: {
      caregivingAgency: 'Care Giving Agency',
      // ...
    }
  }
  ```
- Add to institution types list
- Update filtering logic in search/map

---

### 16. 🗺️ **Rename "Map" to "Institutions" and "List" to "Healthcare Professionals"**
**Priority:** MEDIUM  
**STATUS:** UI/UX IMPROVEMENT

**Current State:**
```typescript
// screens/tabs/HomeScreen.tsx Lines 394-395
{renderSubTabButton('map', 'map-outline', 'Map')}
{renderSubTabButton('list', 'list-outline', 'List')}
```

**Issue:**
- Current labels don't clearly indicate content
- "Map" should indicate it shows institutions/facilities
- "List" should indicate it shows healthcare professionals

**Recommendation:**
- Update labels:
  ```typescript
  {renderSubTabButton('map', 'business-outline', 'Institutions')}
  {renderSubTabButton('list', 'people-outline', 'Healthcare Professionals')}
  ```
- Or shorter versions:
  ```typescript
  {renderSubTabButton('map', 'business-outline', 'Facilities')}
  {renderSubTabButton('list', 'people-outline', 'Professionals')}
  ```
- Update translations in i18n.ts

---

## 🎯 Priority Matrix

### CRITICAL (Must Fix)
1. ❌ Cannot register institution (#3, #7)
2. 🌍 Location restricted to Angola (#2)

### HIGH (Should Fix)
1. ⚠️ Portuguese text still present (#1)
2. 📱 Phone numbers Angolan type only (#4)
3. 💬 Can't see comment box in reviews (#9)
4. 🔍 Review section showing nothing (#10)

### MEDIUM (Nice to Have)
1. 📧 Email verification clarity (#6)
2. 📍 Menu bar positioning (#8)
3. 🚫 Remove license for caregivers (#12)
4. 🏥 Add Caregiver service (#13)
5. 📍 Remove exact location for professionals (#14)
6. 🏢 Add Care Giving Agency type (#15)
7. 🗺️ Rename Map/List tabs (#16)

### LOW (Minor Issues)
1. 📝 Form label wording (#5)
2. 🎨 Add logo (#11)

---

## 📂 Key Files to Modify

### Immediate Priority:
1. `screens/RegisterScreen.tsx` - Fix phone validation, institution registration
2. `components/specific/ServiceReviews.tsx` - Fix Portuguese text, review visibility
3. `components/auth/InstitutionForm.tsx` - Add care agency type, fix Portuguese
4. `components/auth/ProfessionalForm.tsx` - Add caregiver, remove license requirement
5. `utils/i18n.ts` - Add missing translations
6. `navigation/MainTabNavigator.tsx` - Adjust tab bar positioning
7. `screens/tabs/HomeScreen.tsx` - Rename Map/List tabs

---

## 🔧 Implementation Plan

### Phase 1: Critical Fixes (1-2 days)
- [ ] Replace Angolan phone validation with international validation
- [ ] Debug and fix institution registration flow
- [ ] Update location validation error messages to use i18n
- [ ] Test complete registration flow for all user types

### Phase 2: High Priority (2-3 days)
- [ ] Replace all hardcoded Portuguese strings
- [ ] Fix review section visibility and comment box
- [ ] Add proper keyboard handling for review forms
- [ ] Verify Firestore rules for reviews

### Phase 3: Medium Priority (3-4 days)
- [ ] Add "Caregiver" to professional services
- [ ] Add "Care Giving Agency" to institution types
- [ ] Make license field conditional
- [ ] Make exact location optional for professionals
- [ ] Adjust tab bar positioning
- [ ] Rename Map/List tabs with better labels
- [ ] Improve email verification clarity

### Phase 4: Polish (1-2 days)
- [ ] Update form label wording
- [ ] Design and add app logo
- [ ] Final testing on multiple devices
- [ ] Update documentation

---

## ✅ Testing Checklist

- [ ] Register as Normal User (international location)
- [ ] Register as Professional (with and without license)
- [ ] Register as Institution (all types including care agency)
- [ ] Test phone validation for multiple countries
- [ ] Test location picker with international addresses
- [ ] Write and view reviews
- [ ] Test on iOS and Android
- [ ] Test in English and Portuguese
- [ ] Test keyboard behavior in forms
- [ ] Verify email verification flow

---

## 📝 Notes

- The app has a solid internationalization foundation but needs cleanup
- Many solutions already exist in the codebase but aren't being used
- Focus on connecting existing international validation with UI forms
- Review section needs thorough testing for data loading and rendering
- Consider adding country selector during registration for better UX

---

**End of Analysis**
