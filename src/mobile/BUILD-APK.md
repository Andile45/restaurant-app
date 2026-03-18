# Building the Android APK

## Option 1: EAS Build (recommended if you don’t have Android SDK)

Build in the cloud and get an APK (no local Android Studio/SDK needed).

1. Install EAS CLI and log in:
   ```bash
   npm i -g eas-cli
   eas login
   ```
2. From this folder (`src/mobile`), run:
   ```bash
   npm run build:apk:eas
   ```
   Or:
   ```bash
   eas build --platform android --profile preview
   ```
3. When the build finishes, download the APK from the Expo dashboard link printed in the terminal.

---

## Option 2: Local build (requires Android SDK)

You need **Android Studio** (or Android SDK + NDK) and **ANDROID_HOME** set.

1. Set your Android SDK path, e.g. in PowerShell:
   ```powershell
   $env:ANDROID_HOME = "C:\Users\HP\AppData\Local\Android\Sdk"
   ```
   Or add `ANDROID_HOME` in System Environment Variables.  
   If the SDK is elsewhere, create `android/local.properties` with:
   ```properties
   sdk.dir=C:\\Users\\HP\\AppData\\Local\\Android\\Sdk
   ```
   (Use double backslashes and the path where Android Studio installed the SDK.)

2. Generate/update native project (already done if you have an `android` folder):
   ```bash
   npm run prebuild
   ```

3. Build the release APK:
   - From `src/mobile`:
     ```bash
     cd android
     .\gradlew.bat assembleRelease
     ```
   - APK path:
     `android\app\build\outputs\apk\release\app-release.apk`

---

## Summary

| Method   | Command / steps                    | APK output |
|----------|------------------------------------|------------|
| EAS      | `eas build -p android --profile preview` | Download from Expo dashboard |
| Local    | Set ANDROID_HOME → `android\gradlew.bat assembleRelease` | `android\app\build\outputs\apk\release\app-release.apk` |
