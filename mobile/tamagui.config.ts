import { createTamagui, createTokens } from 'tamagui'
import { createInterFont } from '@tamagui/font-inter'
import { createAnimations } from '@tamagui/animations-react-native'

// Handle media driver loading safely for Node/Compiler environment
let createMedia
try {
    createMedia = require('@tamagui/react-native-media-driver').createMedia
} catch (e) {
    console.warn('Tamagui: Error loading react-native-media-driver, falling back to mock', e.message)
    createMedia = (media) => media
}


const tokens = createTokens({
    color: {
        white: '#fff',
        black: '#000',
    },
    space: {
        true: 10,
        0: 0,
        1: 5,
        2: 10,
        3: 15,
        4: 20,
    },
    size: {
        true: 10,
        0: 0,
        1: 5,
        2: 10,
        3: 15,
        4: 20,
    },
    radius: {
        0: 0,
        1: 4,
        2: 8,
        3: 12,
    },
    zIndex: {
        0: 0,
        1: 100,
        2: 200,
    },
})

const config = createTamagui({
    animations: createAnimations({
        bouncy: {
            type: 'spring',
            damping: 10,
            mass: 0.9,
            stiffness: 100,
        },
        lazy: {
            type: 'spring',
            damping: 20,
            stiffness: 60,
        },
        quick: {
            type: 'spring',
            damping: 20,
            mass: 1.2,
            stiffness: 250,
        },
    }),
    fonts: {
        heading: createInterFont(),
        body: createInterFont(),
    },
    themes: {
        light: {
            bg: '#fff',
            color: '#000',
        },
        dark: {
            bg: '#000',
            color: '#fff',
        },
    },
    tokens,
    media: createMedia({
        xs: { maxWidth: 660 },
    }),
    shorthands: {},
})

export default config

export type Conf = typeof config

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf { }
}
