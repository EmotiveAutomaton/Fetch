
const Module = require('module');
const originalRequire = Module.prototype.require;

// List of Node.js built-ins that are NOT available in React Native (unless polyfilled)
// and should not be used in client code.
const FORBIDDEN_MODULES = [
    'path',
    'fs',
    'module',
    'os',
    'crypto',
    'stream',
    'vm',
    'child_process'
];

// Mock require to throw on forbidden modules
Module.prototype.require = function (id) {
    if (FORBIDDEN_MODULES.includes(id)) {
        const error = new Error(`[Verification Error] Client code attempted to require Node.js built-in module: "${id}". This will crash the app on mobile.`);
        error.code = 'VERIFICATION_FAILED';
        throw error;
    }
    return originalRequire.apply(this, arguments);
};

console.log('Verifying client safety for tamagui.config.ts...');
console.log('This script ensures that the config (and its dependencies) does not import Node.js built-ins.');

try {
    // We use esbuild-register to handle TypeScript
    require('esbuild-register/dist/node').register();

    // Attempt to load the config
    // Note: We need to handle module-alias if it's used.
    // In the client bundle, module-alias should ideally be mocked or ignored.
    // If the code uses module-alias, it might try to require 'module' (which is forbidden).
    // So this test will catch that too!

    require('../tamagui.config.ts');
    console.log('SUCCESS: tamagui.config.ts loaded without requiring forbidden modules.');
} catch (error) {
    if (error.code === 'VERIFICATION_FAILED') {
        console.error('FAILURE: Verification failed.');
        console.error(error.message);
    } else {
        console.error('FAILURE: An unexpected error occurred during verification.');
        console.error(error);
    }
    process.exit(1);
}
