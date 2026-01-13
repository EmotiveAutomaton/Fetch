
const path = require('path');

console.log('--- VERIFY BUILD CONTEXT START ---');
console.log('CWD:', process.cwd());

try {
    // 1. Activate the Patch by requiring requireTamaguiCore
    console.log('[VERIFY] Activating Tamagui Patch... SKIPPED (Testing tsconfig)');
    // try {
    //     const { requireTamaguiCore } = require('@tamagui/static/dist/helpers/requireTamaguiCore.cjs');
    //     requireTamaguiCore('native'); // This triggers the patch AND sets env vars
    //     console.log('[VERIFY] Patch activated.');
    // } catch (e) {
    //     console.warn('[VERIFY] Warning: Could not load requireTamaguiCore:', e.message);
    //     // Manually set env vars if requireTamaguiCore fails to load (fallback)
    //     process.env.TAMAGUI_IS_SERVER = '1';
    //     process.env.TAMAGUI_KEEP_THEMES = '1';
    // }

    // console.log('[VERIFY] Env Vars:', {
    //     TAMAGUI_IS_SERVER: process.env.TAMAGUI_IS_SERVER,
    //     TAMAGUI_KEEP_THEMES: process.env.TAMAGUI_KEEP_THEMES
    // });

    // 2. Simulate Metro/Tamagui environment
    require('esbuild-register/dist/node').register();

    const configPath = path.resolve(__dirname, '../tamagui.config.ts');
    console.log('Loading config from:', configPath);

    // 3. Load the config
    const config = require(configPath).default;
    console.log('[VERIFY] Config loaded.');

    // 4. Check for ProxyWorm
    if (config && config._isProxyWorm) {
        console.error('[VERIFY] FAIL: Config is a ProxyWorm!');
        console.error('[VERIFY] Config object:', config);
    } else {
        console.log('[VERIFY] SUCCESS: Config loaded and is valid.');
        console.log('[VERIFY] Themes:', Object.keys(config.themes || {}));
    }

    // 5. Verify Alias Resolution
    console.log('[VERIFY] Checking resolution of react-native...');
    try {
        const rnPath = require.resolve('react-native');
        console.log('react-native resolved to:', rnPath);
        if (rnPath.includes('react-native-web')) {
            console.log('[VERIFY] SUCCESS: react-native is aliased to react-native-web');
        } else {
            console.error('[VERIFY] FAIL: react-native is NOT aliased. Resolved to:', rnPath);
        }
    } catch (e) {
        console.error('[VERIFY] FAILURE: Could not require react-native:', e.message);
    }

} catch (e) {
    console.error('CRITICAL FAILURE:', e);
}
