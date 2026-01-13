
const { requireTamaguiCore } = require('../node_modules/@tamagui/static/dist/helpers/requireTamaguiCore.cjs');
requireTamaguiCore('native'); // Activate patch

const { registerRequire } = require('../node_modules/@tamagui/static/dist/registerRequire.cjs');

console.log('[REPRO] Registering Tamagui Require...');
const { unregister } = registerRequire('web');

try {
    console.log('[REPRO] Attempting to require "react-native"...');
    const rn = require('react-native');
    console.log('[REPRO] Success! react-native loaded:', rn);

    if (rn && rn._isProxyWorm) {
        console.error('[REPRO] FAIL: react-native is a ProxyWorm!');
    } else {
        console.log('[REPRO] react-native is NOT a ProxyWorm.');
    }
} catch (e) {
    console.error('[REPRO] CRITICAL FAILURE: require("react-native") threw:', e);
} finally {
    unregister();
}
