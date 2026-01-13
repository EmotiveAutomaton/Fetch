
// Mock for react-native/Libraries/Pressability/Pressability and usePressability
// This is needed because Tamagui native core imports these, but they don't exist in react-native-web.

const MockPressability = function () {
    return {
        configure: () => { },
        reset: () => { },
    };
};

module.exports = {
    default: MockPressability,
};
