import { XStack, Button, Text, useTheme } from 'tamagui'
import { Menu, ChevronDown } from '@tamagui/lucide-icons'
import { Image, Platform } from 'react-native'
import Constants from 'expo-constants'
import { useStore } from '../lib/store'

export function HomeHeader({ setMenuOpen }: { setMenuOpen: (open: boolean) => void }) {
    const theme = useTheme()
    const { mode, setMode } = useStore()

    // Explicitly use Constants.statusBarHeight for Android to ensure clearance
    const paddingTop = Platform.OS === 'android' ? Constants.statusBarHeight + 10 : 10

    return (
        <XStack
            bg="$background"
            pt={paddingTop}
            px="$2"
            pb="$2"
            ai="center"
            jc="space-between"
            elevation="$1"
            style={{ backgroundColor: theme.bg.val }}
        >
            {/* Left: Menu Button */}
            <Button
                unstyled
                p="$2"
                icon={<Menu size="$1.5" color="$color" />}
                onPress={() => setMenuOpen(true)}
            />

            {/* Center: Mode Selector */}
            <Button
                size="$3"
                chromeless
                iconAfter={ChevronDown}
                onPress={() => setMode(mode === 'public' ? 'private' : 'public')}
            >
                <Text fontWeight="bold" fontSize="$4">
                    Fetch {mode === 'public' ? 'Public' : 'Private'}
                </Text>
            </Button>

            {/* Right: Profile Image */}
            <XStack ai="center" gap="$3" pr="$2">
                <Image
                    source={require('../assets/icon.png')}
                    style={{ width: 28, height: 28, borderRadius: 5 }}
                />
            </XStack>
        </XStack>
    )
}
