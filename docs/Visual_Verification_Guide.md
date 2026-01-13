# Visual Verification Pipeline Guide

This document outlines the process for visually verifying the Fetch mobile application using the local Android Emulator pipeline established for this project.

## Prerequisites

The Android SDK and Emulator have been manually configured in the project workspace to ensure portability and avoid system-level conflicts.

*   **SDK Location:** `E:\EmotiveAutomaton\Projects\fetch\android-sdk`
*   **AVD Name:** `test`
*   **Platform:** Android 13 (Tiramisu, API 33)

## 1. Environment Setup

Before running any commands, ensure the environment variables are set correctly for the current session. Run this in your PowerShell terminal:

```powershell
$env:ANDROID_HOME="E:\EmotiveAutomaton\Projects\fetch\android-sdk"
$env:PATH+=";E:\EmotiveAutomaton\Projects\fetch\android-sdk\platform-tools"
$env:PATH+=";E:\EmotiveAutomaton\Projects\fetch\android-sdk\emulator"
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
```

## 2. Launching the Emulator

Start the Android Emulator in a separate terminal window or background process:

```powershell
& "E:\EmotiveAutomaton\Projects\fetch\android-sdk\emulator\emulator.exe" -avd test -no-boot-anim -gpu swiftshader_indirect -no-audio
```

*   **Note:** `-gpu swiftshader_indirect` is used to ensure compatibility if hardware acceleration is flaky.
*   Wait for the device to be ready:
    ```powershell
    adb wait-for-device
    ```

## 3. Running the Application

Start the Expo development server and launch the app on the connected emulator:

```powershell
cd mobile
npx expo start --android
```

*   If prompted for a port (e.g., if 8081 is busy), accept the alternative (e.g., 8083).

## 4. Visual Verification Loop

Since we are operating in a headless or remote-like environment where direct GUI access might be limited, use the following loop to verify UI changes:

1.  **Make Code Changes**: Edit your React Native / Tamagui code.
2.  **Wait for Reload**: Expo Fast Refresh should automatically update the app on the emulator.
3.  **Capture Screenshot**: Run the following command to take a screenshot on the device and pull it to your local machine for inspection.

    ```powershell
    adb shell screencap -p /sdcard/screen.png
    adb pull /sdcard/screen.png "C:\Users\abrah\.gemini\antigravity\brain\809b3cf8-48b4-4107-b243-d9704d31344e\verification_capture.png"
    ```

4.  **Inspect**: Open `verification_capture.png` in your browser or image viewer to verify the layout.

## Troubleshooting

*   **"adb not found"**: Re-run the Environment Setup step to ensure `platform-tools` is in your PATH.
*   **Emulator fails to start**: Check if another emulator instance is running. Kill it via Task Manager or `adb kill-server`.
*   **Header Clipping**: Ensure `headerStatusBarHeight` is explicitly set in `Stack.Screen` options for Android, as `edgeToEdgeEnabled` in `app.json` can cause overlap.

```typescript
// app/(home)/_layout.tsx
headerStatusBarHeight: Platform.OS === 'android' ? StatusBar.currentHeight : undefined,
```
