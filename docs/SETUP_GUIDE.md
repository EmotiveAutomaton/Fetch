# Fetch Setup & Workflow Guide

## 🎯 Which workflow do you need?

| Goal | Workflow | Command |
| :--- | :--- | :--- |
| **"I want the app on my phone forever."** | **Permanent Install** (Release) | `npm run android:release` |
| **"I am coding and need fast updates."** | **Iterative Dev** (Dev Client) | `npx expo start --dev-client` |

---

## 📦 Workflow A: Permanent Install (Release)
Use this to create a standalone version of the app that works **offline**, away from your computer.

### 1. Build & Install
```powershell
cd mobile
npm run android:release
```

### 2. Verify
1.  Wait for the command to finish (~5 mins).
2.  Disconnect USB.
3.  The app **"Fetch"** is now permanently installed.

---

## ⚡ Workflow B: Iterative Development (Dev Client)
Use this when you are actively modifying code. Changes appear instantly (Fast Refresh).

### 1. Start the Server
```powershell
cd mobile
npx expo start --dev-client
```

### 2. Connect Device
1.  **USB**: Plug in your phone.
2.  **Wireless** (Optional):
    ```powershell
    adb tcpip 5555
    adb connect 192.168.0.XXX:5555
    ```

### 3. Open App
1.  Launch **"Fetch"** manually on your phone.
2.  It will connect to the server automatically.
3.  *Trouble connecting?* Shake phone -> "Reload".

> **App Missing or Crashing?** Run `npx expo run:android` once to install the debug version.

---

## 📦 One-Time Setup (First Time / New PC)

### 1. Prerequisites
*   **Node.js LTS** (v18+) & **Java JDK 17**.
*   **Android Studio** installed with:
    *   `Android SDK Platform-Tools`
    *   `Android SDK Build-Tools`
*   **Environment Variables**:
    *   `ANDROID_HOME` -> `C:\Users\[User]\AppData\Local\Android\Sdk`
    *   `JAVA_HOME` -> `C:\Program Files\Java\jdk-17...`
    *   Add to `PATH`: `%ANDROID_HOME%\platform-tools`

### 2. Initial Build
Run this once to create the "Fetch" app on your phone:
```powershell
cd mobile
npm install
npm run prebuild:clean
npx expo run:android
```
*(This takes ~5-10 mins. It compiles the native Android project.)*

---

## 🔧 Troubleshooting

### "Version Incompatible / SDK 52 vs 54"
**You are likely opening the wrong app.**
*   **Stop** using the "Expo Go" app (Triangle Icon).
*   **Start** using the "Fetch" app that we built.
*   If the "Fetch" app is missing, run `npx expo run:android` to install it.

### "JavaScript Heap Out of Memory"
If the build crashes on Windows:
```powershell
set NODE_OPTIONS=--max-old-space-size=8192
npx expo run:android
```

### "Connection Refused" (Wireless)
Your phone likely rebooted or changed IP.
*   Plug in USB -> `adb tcpip 5555` -> Unplug -> Reconnect.

---

## 🔌 Backend Connection

The Fetch backend runs on your local network. Configure the API endpoint in `lib/api.ts`:

```typescript
// For physical device: Use your computer's LAN IP
const API_URL = 'http://192.168.X.X:8000';

// For Android Emulator
const API_URL = 'http://10.0.2.2:8000';
```

### Starting the Backend
```powershell
cd e:\EmotiveAutomaton\Projects\Fetch
.\.venv\Scripts\activate
uvicorn src.main:app --reload --host 0.0.0.0
```
