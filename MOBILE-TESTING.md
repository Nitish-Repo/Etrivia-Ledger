# Mobile Testing Guide - Android & iOS

## ✅ Setup Complete!

Both Android and iOS platforms have been added to your project with SQLite support.

---

## 📱 Testing on Android

### Prerequisites
- **Android Studio** installed
- **Android SDK** configured
- **USB Debugging** enabled on your Android device (or use emulator)

### Steps to Run on Android

#### 1. Open in Android Studio
```powershell
npx cap open android
```

#### 2. In Android Studio:
- Wait for Gradle sync to complete
- Select your device/emulator from the dropdown
- Click the **Run** button (green play icon) or press **Shift+F10**

#### 3. Or Run from Command Line (if device connected):
```powershell
npx cap run android
```

### Android Configuration
✅ **minSdkVersion**: Set to 22 (required for SQLite)
✅ **Plugins**: All 6 Capacitor plugins detected including SQLite

### Testing Checklist for Android
- [ ] App launches successfully
- [ ] Database status shows "Connected ✓"
- [ ] Can add users
- [ ] Can edit user names
- [ ] Can toggle active/inactive status
- [ ] Can delete users with confirmation
- [ ] Data persists after closing and reopening app

---

## 🍎 Testing on iOS

### Prerequisites
- **macOS** (required for iOS development)
- **Xcode** installed
- **CocoaPods** installed (`sudo gem install cocoapods`)
- **iOS device** or simulator

### Steps to Run on iOS

#### 1. Install CocoaPods Dependencies
```powershell
cd ios/App
pod install
cd ../..
```

#### 2. Open in Xcode
```powershell
npx cap open ios
```

#### 3. In Xcode:
- Select your target device/simulator
- Click the **Run** button (play icon) or press **Cmd+R**
- Sign the app with your Apple Developer account (if deploying to device)

#### 4. Or Run from Command Line:
```powershell
npx cap run ios
```

### iOS Configuration
✅ **No special configuration needed** for SQLite
✅ **Plugins**: All 6 Capacitor plugins detected including SQLite

### Testing Checklist for iOS
- [ ] App launches successfully
- [ ] Database status shows "Connected ✓"
- [ ] Can add users
- [ ] Can edit user names
- [ ] Can toggle active/inactive status
- [ ] Can delete users with confirmation
- [ ] Data persists after closing and reopening app

---

## 🔄 Development Workflow

### Make Changes to Code
1. Edit your TypeScript/HTML/CSS files
2. Build the web assets:
   ```powershell
   npm run build
   ```
3. Sync to native platforms:
   ```powershell
   npx cap sync
   ```
4. Rebuild in Android Studio/Xcode

### Quick Sync (after code changes)
```powershell
npm run build && npx cap sync
```

### Live Reload (Development Mode)
```powershell
ionic cap run android -l --external
# or
ionic cap run ios -l --external
```

---

## 🗄️ Database Storage Locations

### Android
**Path**: `/data/data/io.ionic.starter/databases/`
- Can view with **Device File Explorer** in Android Studio
- Or use `adb shell` to access

### iOS
**Path**: `~/Library/Developer/CoreSimulator/Devices/[DEVICE_ID]/data/Containers/Data/Application/[APP_ID]/Library/LocalDatabase/`
- Can view in Xcode **View** → **Debug Area** → **Show Debug Navigator**
- Use SQLite browser tools to inspect

---

## 🐛 Common Issues & Solutions

### Android Issues

**Issue**: Gradle sync fails
**Solution**: 
- Update Android Studio to latest version
- Sync Project with Gradle Files
- Clean & Rebuild: `Build → Clean Project`

**Issue**: Database not working
**Solution**:
- Check `minSdkVersion` is 22 or higher in `android/app/build.gradle`
- Run `npx cap sync android` again

**Issue**: App crashes on startup
**Solution**:
- Check Logcat in Android Studio for errors
- Ensure all permissions are granted in `AndroidManifest.xml`

### iOS Issues

**Issue**: Pod install fails
**Solution**:
```powershell
cd ios/App
pod repo update
pod install
```

**Issue**: Signing error
**Solution**:
- In Xcode, select your project
- Go to **Signing & Capabilities**
- Select your development team

**Issue**: Database not working
**Solution**:
- Ensure app has proper permissions
- Check Console output in Xcode for errors

---

## 📊 Testing Database on Mobile

### View Console Logs
**Android**: Use **Logcat** in Android Studio
**iOS**: Use **Console** in Xcode (View → Debug Area → Activate Console)

### Expected Console Output
```
🚀 Starting app initialization...
📱 Platform detected: android (or ios)
💾 Initializing database: myuserdb
✅ App initialization complete!
👤 UsersComponent initialized
✅ Database connected
📋 Loaded X users
```

### Debugging Tools
- **Android**: Chrome DevTools (`chrome://inspect`)
- **iOS**: Safari Web Inspector (Safari → Develop → [Your Device])

---

## 🚀 Building for Production

### Android APK
```powershell
# Build web assets
npm run build

# Sync to Android
npx cap sync android

# Open in Android Studio
npx cap open android

# In Android Studio:
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

### iOS App
```powershell
# Build web assets
npm run build

# Sync to iOS
npx cap sync ios

# Open in Xcode
npx cap open ios

# In Xcode:
# Product → Archive
# Follow prompts to upload to App Store Connect
```

---

## 📝 Quick Reference Commands

| Task | Command |
|------|---------|
| Build web assets | `npm run build` |
| Sync all platforms | `npx cap sync` |
| Sync Android only | `npx cap sync android` |
| Sync iOS only | `npx cap sync ios` |
| Open Android Studio | `npx cap open android` |
| Open Xcode | `npx cap open ios` |
| Run on Android | `npx cap run android` |
| Run on iOS | `npx cap run ios` |
| Live reload Android | `ionic cap run android -l` |
| Live reload iOS | `ionic cap run ios -l` |

---

## ✅ Ready to Test!

Your app is now ready for mobile testing. Choose your platform:

### For Android Testing:
```powershell
npx cap open android
```

### For iOS Testing (macOS only):
```powershell
npx cap open ios
```

**Note**: The web version continues to work at `http://localhost:8100` when you run `npm start`

---

**Last Updated**: November 19, 2025  
**Platform Support**: ✅ Web | ✅ Android | ✅ iOS
