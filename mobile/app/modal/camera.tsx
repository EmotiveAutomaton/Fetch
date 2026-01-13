import { YStack, Text, H3 } from 'tamagui'
import { Stack } from 'expo-router'

export default function CameraModal() {
    return (
        <YStack f={1} ai="center" jc="center" bg="$background" p="$4">
            <Stack.Screen options={{ title: 'Coop Camera', presentation: 'modal' }} />
            <H3>Coop Camera</H3>
            <Text fontSize="$5" color="$gray10" mt="$4">Under Development</Text>
        </YStack>
    )
}
