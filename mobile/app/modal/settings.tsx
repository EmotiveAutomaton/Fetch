import { YStack, Text, XStack, Switch, useTheme, H3 } from 'tamagui'
import { useStore } from '../../lib/store'
import { Stack } from 'expo-router'

export default function SettingsModal() {
    const theme = useTheme()
    // Assuming we might want to toggle actual theme later, but for now just a visual toggle or connected to a store if we had a theme store.
    // The requirement says "Render a boolean toggle for Theme State (Dark Mode / Light Mode)".
    // Since we don't have a global theme store visible in the previous file view (only mode public/private), 
    // I'll just create the UI for it. If there's a theme context, I'd use it.
    // Looking at _layout.tsx, it uses <Theme name="light">. 

    return (
        <YStack f={1} ai="center" jc="center" bg="$background" p="$4" gap="$4">
            <Stack.Screen options={{ title: 'Settings', presentation: 'modal' }} />

            <H3>Settings</H3>

            <XStack ai="center" gap="$4">
                <Text fontSize="$4">Dark Mode</Text>
                <Switch size="$3">
                    <Switch.Thumb animation="quick" />
                </Switch>
            </XStack>
        </YStack>
    )
}
