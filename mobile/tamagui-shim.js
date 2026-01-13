// This shim is used to fix Tamagui config loading in Node.js environments (like the Tamagui compiler).
// It aliases 'react-native' to 'react-native-web' to avoid "Unexpected token" errors caused by
// untranspiled native code in the 'react-native' package.

try {
    const moduleAlias = require('module-alias');
    const path = require('path'); // This line can cause issues in React Native environment

    moduleAlias.addAlias('react-native', 'react-native-web');

    // Mock deep imports that are missing in react-native-web but required by @tamagui/core/native
    const pressabilityMock = path.resolve(__dirname, './mocks/Pressability.js');
    moduleAlias.addAlias('react-native/Libraries/Pressability/Pressability', pressabilityMock);
    moduleAlias.addAlias('react-native/Libraries/Pressability/usePressability', pressabilityMock);

} catch (e) {
    // module-alias might not be installed or other error, but we try our best.
    // In React Native environment, 'path' might not be available, leading to an error here.
    console.error('Failed to apply tamagui-shim aliases:', e);
}
