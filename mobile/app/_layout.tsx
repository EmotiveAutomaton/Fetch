import { TamaguiProvider, Theme, PortalProvider } from 'tamagui'
import { Slot } from 'expo-router'
import { useFonts } from 'expo-font'
import { useEffect } from 'react'
import config from '../tamagui.config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

const queryClient = new QueryClient()

export default function RootLayout() {
    const [loaded] = useFonts({
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    })

    useEffect(() => {
        if (loaded) {
            // can hide splash screen here
        }
    }, [loaded])

    if (!loaded) {
        return null
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <TamaguiProvider config={config}>
                        <PortalProvider>
                            <Theme name="light">
                                <Slot />
                            </Theme>
                        </PortalProvider>
                    </TamaguiProvider>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}
