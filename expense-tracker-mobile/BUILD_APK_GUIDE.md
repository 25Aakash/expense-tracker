# 📱 Building APK for DailyCashBook Expense Tracker

## Prerequisites
1. **EAS CLI** - Install globally if not already installed
2. **Expo Account** - You need to be logged in

## Steps to Build APK

### Step 1: Install EAS CLI (if not installed)
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
cd expense-tracker-mobile
eas login
```
Enter your Expo credentials (username: kaakash)

### Step 3: Build the APK

For **Preview/Testing APK** (faster, includes debugging):
```bash
eas build --profile preview --platform android
```

For **Production APK** (optimized, smaller size):
```bash
eas build --profile production-apk --platform android
```

### Step 4: Wait for Build to Complete
- The build process takes 10-20 minutes
- You'll see build progress in the terminal
- You can also monitor at: https://expo.dev/accounts/kaakash/projects/dailycashbook/builds

### Step 5: Download the APK
Once the build completes:
- You'll get a download link in the terminal
- Or visit: https://expo.dev and navigate to your project → Builds
- Download the `.apk` file

### Step 6: Install on Android Device
1. Transfer the APK to your Android device
2. Enable "Install from Unknown Sources" in Settings
3. Tap the APK file to install
4. Open DailyCashBook app!

---

## Build Profiles Available

### 1. **preview** (Recommended for testing)
- Build Type: APK
- Distribution: Internal
- Easy to share and test
- Faster build time

### 2. **production-apk** (For final release)
- Build Type: APK
- Distribution: Production-ready
- Optimized and minified
- Smallest file size

### 3. **preview-aab** (For Play Store testing)
- Build Type: AAB (Android App Bundle)
- Required for internal testing on Play Store

### 4. **production** (For Play Store release)
- Build Type: AAB (Android App Bundle)
- For submitting to Google Play Store

---

## Quick Commands Reference

```bash
# Login to Expo
eas login

# Build preview APK (testing)
eas build --profile preview --platform android

# Build production APK (release)
eas build --profile production-apk --platform android

# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Download specific build
eas build:download [build-id]
```

---

## Troubleshooting

### Build Failed?
1. Check build logs: `eas build:view [build-id]`
2. Ensure all dependencies are properly installed
3. Verify app.json configuration is correct

### APK Not Installing?
1. Enable "Install from Unknown Sources"
2. Check Android version compatibility (minimum SDK version)
3. Ensure sufficient storage space

### App Crashes on Launch?
1. Check if all required permissions are granted
2. Verify API URL is accessible (https://expense-tracker-hirq.onrender.com)
3. Check device logs using `adb logcat`

---

## App Details

- **App Name**: DailyCashBook
- **Package**: com.expensetracker.pro
- **Version**: 1.0.0
- **Version Code**: 1
- **Owner**: kaakash
- **Project ID**: 28630534-7fe0-49ea-ab8d-246e2037faaa

---

## Next Steps After Building

1. **Test the APK** thoroughly on different devices
2. **Share with testers** for feedback
3. **Fix any issues** found during testing
4. **Build production version** when ready
5. **Submit to Play Store** (optional)

---

## Play Store Submission (Optional)

If you want to publish on Google Play Store:

1. Create a Google Play Developer account ($25 one-time fee)
2. Build AAB format: `eas build --profile production --platform android`
3. Submit: `eas submit --platform android`
4. Fill in store listing details
5. Wait for Google review (typically 1-3 days)

---

## Support

- Expo Documentation: https://docs.expo.dev/
- EAS Build Guide: https://docs.expo.dev/build/introduction/
- Your Project: https://expo.dev/accounts/kaakash/projects/dailycashbook

---

**Note**: The first build might take longer as it sets up the build environment. Subsequent builds will be faster.
