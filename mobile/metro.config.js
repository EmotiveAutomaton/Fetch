// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
    // [Web-only] Enables CSS support in Metro.
    isCSSEnabled: true,
})

// 2. Enable Tamagui
const { withTamagui } = require('@tamagui/metro-plugin')

// 3. Custom Resolver to exclude Node.js-only shim from the bundle
config.resolver.resolveRequest = (context, moduleName, platform) => {
    // When the bundle tries to import 'tamagui-shim', redirect it to an empty mock.
    // This prevents the Node.js code (module-alias, path) from being included in the app.
    if (moduleName.includes('tamagui-shim')) {
        return {
            filePath: path.resolve(__dirname, './mocks/empty.js'),
            type: 'sourceFile',
        }
    }
    
    // Also mock module-alias just in case it's imported elsewhere
    if (moduleName === 'module-alias') {
        return {
            filePath: path.resolve(__dirname, './mocks/empty.js'),
            type: 'sourceFile',
        }
    }

    return context.resolveRequest(context, moduleName, platform)
}

module.exports = withTamagui(config, {
    components: ['tamagui'],
    config: './tamagui.config.ts',
    outputCSS: './tamagui-web.css',
})
