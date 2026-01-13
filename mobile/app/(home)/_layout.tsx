import { Tabs } from 'expo-router'
import { MessageSquare, Inbox } from '@tamagui/lucide-icons'
import { useTheme } from 'tamagui'

export default function HomeLayout() {
    const theme = useTheme()

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.color?.val,
                tabBarStyle: {
                    backgroundColor: theme.background?.val,
                    borderTopColor: theme.borderColor?.val,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Chat',
                    tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="deck"
                options={{
                    title: 'The Deck',
                    tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} />,
                }}
            />
        </Tabs>
    )
}
