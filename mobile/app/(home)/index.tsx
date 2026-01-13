import { View, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { YStack, Text, Input, XStack, Button, useTheme, Spinner } from 'tamagui'
import { Send } from '@tamagui/lucide-icons'
import { useState, useEffect, useRef } from 'react'
import { startDiscovery, onServiceFound } from '../../lib/discovery'
import { api } from '../../lib/api'
import { useStore } from '../../lib/store'

interface Message {
    id: string
    text: string
    sender: 'user' | 'bot' | 'system'
}

export default function ChatScreen() {
    const [messages, setMessages] = useState<Message[]>([{ id: '1', text: '*adjusts spectacles* Hmph. Another day, another inbox. I am Archimedes—your executive assistant. Now then, what chaos shall we tame together?', sender: 'bot' }])
    const [text, setText] = useState('')
    const { mode } = useStore()
    const [isLoading, setIsLoading] = useState(false)
    const listRef = useRef<any>(null)

    useEffect(() => {
        startDiscovery()
        const unsub = onServiceFound((service) => {
            console.log('Service found in UI:', service)
        })
        return () => {
            unsub()
        }
    }, [])

    const sendMessage = async () => {
        if (!text.trim() || isLoading) return

        const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' }
        setMessages(prev => [...prev, userMsg])
        setText('')
        setIsLoading(true)

        try {
            const response = await api.chat(userMsg.text, mode)
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                sender: 'bot'
            }
            setMessages(prev => [...prev, botMsg])
        } catch (error: any) {
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: `Error: ${error.message}`,
                sender: 'system'
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsLoading(false)
            // Scroll to bottom
            setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
        }
    }

    const renderItem = ({ item }: { item: Message }) => (
        <YStack
            p="$3"
            bg={item.sender === 'user' ? '$color' : item.sender === 'system' ? '$red4' : '$background'}
            br="$4"
            bw={1}
            bc="$borderColor"
            als={item.sender === 'user' ? 'flex-end' : 'flex-start'}
            m="$2"
            maw="80%"
        >
            <Text color={item.sender === 'user' ? '$background' : '$color'}>{item.text}</Text>
        </YStack>
    )

    return (
        <YStack f={1}>
            <ImageBackground
                source={require('../../assets/bg.jpg')}
                style={{ flex: 1 }}
                resizeMode="cover"
            >

                {/* @ts-ignore */}
                <FlashList<Message>
                    ref={listRef}
                    data={messages}
                    renderItem={renderItem}
                    estimatedItemSize={50}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    inverted={false}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                >
                    <XStack
                        p="$3"
                        bg="$background"
                        ai="center"
                        gap="$3"
                        borderColor="$gray4"
                        bw={1}
                        btlr="$4"
                        btrr="$4"
                    >
                        <Input
                            f={1}
                            placeholder="Fetch..."
                            value={text}
                            onChangeText={setText}
                            onSubmitEditing={sendMessage}
                        />
                        <Button
                            icon={isLoading ? <Spinner /> : Send}
                            circular
                            onPress={sendMessage}
                            disabled={isLoading || !text.trim()}
                            opacity={isLoading || !text.trim() ? 0.5 : 1}
                        />
                    </XStack>
                </KeyboardAvoidingView>
            </ImageBackground>
        </YStack>
    )
}
