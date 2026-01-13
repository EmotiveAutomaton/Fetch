
const path = require('path');
const fs = require('fs');

// Register esbuild-register to handle TypeScript files
const { register } = require('esbuild-register/dist/node');
register({
    target: 'node16',
});

const configPath = path.resolve(__dirname, '../tamagui.config.ts');

console.log(`Attempting to load config from: ${configPath}`);

try {
// Check what react-native resolves to
try {
const rnPath = require.resolve('react-native');
console.log(`'react-native' resolves to: ${rnPath}`);

try {
const pressabilityPath = require.resolve('react-native/Libraries/Pressability/Pressability');
console.log(`'react-native/Libraries/Pressability/Pressability' resolves to: ${pressabilityPath}`);
} catch (e) {
console.log(`Could not resolve 'react-native/Libraries/Pressability/Pressability': ${e.message}`);
}

} catch (e) {
console.log(`Could not resolve 'react-native': ${e.message}`);
}

  // Clear require cache to ensure fresh load
  delete require.cache[require.resolve(configPath)];

  console.log('Loading config (which should apply shim)...');
  const config = require(configPath);
  console.log('Config loaded successfully.');

  // Now try to load the native core. 
  // Since the config loaded the shim, 'react-native' should be aliased to 'react-native-web'.
  // So loading native core should now succeed (or at least not fail with SyntaxError).
  console.log('Attempting to load @tamagui/core/native (post-shim)...');
  try {
      require('@tamagui/core/native');
      console.log('Success: @tamagui/core/native loaded.');
  } catch (e) {
      console.error('ERROR: Failed to load @tamagui/core/native after shim.');
      throw e;
  }

    if (!config.default) {
        console.error('ERROR: Config does not have a default export.');
        process.exit(1);
    }

    const loadedConfig = config.default;

    // Basic validation
    if (!loadedConfig.themes) {
        console.error('ERROR: Config is missing "themes".');
        process.exit(1);
    }

    if (!loadedConfig.tokens) {
        console.error('ERROR: Config is missing "tokens".');
        process.exit(1);
    }

    // Check for the specific issue we had (empty/mocked media driver leading to missing keys?)
    // Actually, the main issue is the crash during load.

    console.log('Verification PASSED: Config structure looks valid.');
    process.exit(0);

} catch (error) {
    console.error('Verification FAILED: Error loading config.');
    console.error(error);
    process.exit(1);
}
