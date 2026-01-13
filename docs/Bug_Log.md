# Bug Log

> [!IMPORTANT]
> **Policy**: If a bug is seen a second time after an attempted fix, we MUST try a fundamentally different approach. Do not repeat the same fix.

## Active Bugs

*None at the moment.*

## Resolved Bugs

### 1. `PortalDispatchContext` cannot be null
**Severity**: Critical (App Crash)
**Status**: Resolved

#### Issue Description
The application crashed on startup with `[Error: 'PortalDispatchContext' cannot be null...]` despite `PortalProvider` being present in the root layout.

#### Root Cause Analysis
**Duplicate Dependencies (Context Hell)**:
- `@tamagui/sheet` had its own nested copy of `@tamagui/portal` in `node_modules/@tamagui/sheet/node_modules/@tamagui/portal`.
- The root `PortalProvider` (imported from the top-level `@tamagui/portal`) created a Context instance.
- The `Sheet` component (imported from `@tamagui/sheet`) used the Context from its *nested* `@tamagui/portal`.
- Since React Contexts are identified by reference, the Consumer in `Sheet` could not see the Provider from the root, even though they were technically the same version.

#### Resolution
- **Action**: Ran `npm dedupe` in the `mobile` directory.
- **Result**: The nested `@tamagui/portal` was removed (deduplicated), forcing `@tamagui/sheet` to use the top-level `@tamagui/portal`. This aligned the Context instances.

### 2. `TypeError: Cannot read property 'setValue' of undefined`
**Severity**: Critical (App Crash)
**Status**: Resolved

#### Issue Description
After fixing the Portal error, the app crashed with `TypeError: Cannot read property 'setValue' of undefined` when rendering components that use animations (like `Sheet`). Console logs warned: `WARN No animation driver configured`.

#### Root Cause Analysis
**Missing Animation Driver**:
- Tamagui requires an animation driver to be explicitly configured in `createTamagui`.
- The `tamagui.config.ts` file was missing the `animations` key.
- Without a driver, Tamagui components attempt to access animation values that don't exist, leading to the crash.

#### Resolution
- **Action**: Installed `@tamagui/animations-react-native`.
- **Action**: Updated `tamagui.config.ts` to import `createAnimations` and add it to the config.

### 3. Layout Issues (Clipped Header, Missing Chatbox)
**Severity**: Major (UI Broken)
**Status**: Resolved

#### Issue Description
- **Header Clipping on Android:**
  - **Status:** Resolved
  - **Issue:** The top navigation bar text ("Fetch Public") was partially cut off on Android Emulator.
  - **Fix:** Disabled the default navigation header (`headerShown: false`) and implemented a custom `HomeHeader` component. Used `Constants.statusBarHeight` (from `expo-constants`) to add explicit top padding on Android, ensuring deterministic clearance for the status bar. Verified with strict visual inspection.

- **Syntax Error in Layout:**
  - **Status:** Resolved
  - **Issue:** `SyntaxError: Adjacent JSX elements must be wrapped in an enclosing tag` in `app/(home)/_layout.tsx` caused by accidental code duplication during refactoring.
  - **Fix:** Removed the duplicate code block at the end of the file. the status bar area on Android.
- **Missing Chatbox**: `KeyboardAvoidingView` behavior was `undefined` on Android, which can cause content to be hidden or not adjusted correctly.
- **Missing Images**: The root `YStack` had `bg="$background"`, which might have been masking the `ImageBackground` or conflicting with its layout.

#### Root Cause Analysis
- **Header Clipping**: Missing `SafeAreaProvider` in the root layout, causing the app to not respect the status bar area on Android.
- **Missing Chatbox**: `KeyboardAvoidingView` behavior was `undefined` on Android, which can cause content to be hidden or not adjusted correctly.
- **Missing Images**: The root `YStack` had `bg="$background"`, which might have been masking the `ImageBackground` or conflicting with its layout.

#### Resolution
- **Action**: Added `SafeAreaProvider` to `app/_layout.tsx`.
- **Action**: Changed `KeyboardAvoidingView` behavior to `'height'` on Android in `app/(home)/index.tsx`.
- **Action**: Removed `bg="$background"` from the root `YStack` in `app/(home)/index.tsx`.

### 4. Tamagui Configuration Loading (SyntaxError / Empty Config)
**Severity**: Critical (Build Failure / Runtime Crash)
**Status**: Resolved

#### Issue Description
The mobile application failed to build and run due to a persistent error during the Tamagui configuration loading process. This resulted in a runtime crash (`TypeError: Cannot read property 'val' of undefined`) because the theme configuration was empty/proxied.

#### Symptoms
1.  **Build Log Error**:
    ```
    Error in Tamagui parse, skipping Unexpected token '{' SyntaxError: Unexpected token '{'
    ...
    at Module.<anonymous> (.../node_modules/@tamagui/core/dist/native.cjs:5372:1)
    ```
2.  **Runtime Error**:
    ```
    ERROR  [TypeError: Cannot read property 'val' of undefined]
    ```
3.  **Tamagui Warning**:
    ```
    Got a empty / proxied config!
    ```

#### Root Cause Analysis
The core issue was a conflict between the **Node.js environment** (used by the Tamagui Compiler/Metro to generate the config) and the **React Native environment** (used by the app runtime).

1.  **The Need for a Shim**:
    - The Tamagui Compiler runs in Node.js and loads `tamagui.config.ts`.
    - `@tamagui/core/native` requires `react-native`.
    - The `react-native` package contains untranspiled code (Flow/JSX) which Node.js cannot parse.
    - **Solution**: We introduced `tamagui-shim.js` to alias `react-native` to `react-native-web` (which is CommonJS and Node-compatible) using `module-alias`.

2.  **The Regression (Platform Extensions)**:
    - To prevent the shim (which uses Node built-ins) from crashing the **App Runtime**, we created platform-specific files.
    - **The Failure**: The Compiler picked up the empty shim (due to platform resolution rules) and failed to alias `react-native`.

#### Final Resolution
We applied a comprehensive patch via `patch-package` that fixes both issues:
1.  **Patched `registerRequire.cjs`**: Corrected the `og.apply` call to allow `react-native` to be attempted (and thus intercepted).
2.  **Patched `requireTamaguiCore.cjs`**: Updated the `Module._resolveFilename` hook to intercept deep imports (`react-native/Libraries/Pressability/Pressability` and `usePressability`) and redirect them to a local mock (`mocks/Pressability.js`).

#### Verification
- **Reproduction Script**: `scripts/reproduce-bug.js` now passes.
- **App Build**: `npx expo start --clear` successfully loads the Tamagui configuration without errors.
