import React, { useState } from 'react'
import { Dimensions } from 'react-native'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS
} from 'react-native-reanimated'
import { YStack, Text, Card, Button, XStack, H4, Paragraph } from 'tamagui'
import { Check, X } from '@tamagui/lucide-icons'

const SCREEN_WIDTH = Dimensions.get('window').width
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25

interface Draft {
    id: string
    email_subject: string
    email_sender: string
    proposed_body: string
    reasoning_trace?: string
}

interface DeckProps {
    drafts: Draft[]
    onSwipeRight: (id: string) => void
    onSwipeLeft: (id: string) => void
}

export function Deck({ drafts, onSwipeRight, onSwipeLeft }: DeckProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const translateX = useSharedValue(0)
    const rotate = useSharedValue(0)

    const currentDraft = drafts[currentIndex]

    const onSwipeComplete = (direction: 'left' | 'right') => {
        const id = currentDraft.id
        if (direction === 'right') {
            onSwipeRight(id)
        } else {
            onSwipeLeft(id)
        }
        translateX.value = 0
        rotate.value = 0
        setCurrentIndex(prev => prev + 1)
    }

    const panGesture = Gesture.Pan()
        .onBegin(() => {
            // No-op, event.translationX is relative to the start of the gesture
        })
        .onUpdate((event) => {
            translateX.value = event.translationX
            rotate.value = (event.translationX / SCREEN_WIDTH) * 20
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD) {
                translateX.value = withSpring(SCREEN_WIDTH + 100)
                runOnJS(onSwipeComplete)('right')
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withSpring(-SCREEN_WIDTH - 100)
                runOnJS(onSwipeComplete)('left')
            } else {
                translateX.value = withSpring(0)
                rotate.value = withSpring(0)
            }
        })

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` }
        ]
    }))

    if (currentIndex >= drafts.length) {
        return (
            <YStack f={1} ai="center" jc="center" p="$4">
                <Text fontSize="$6" ta="center">All caught up! 🐶</Text>
            </YStack>
        )
    }

    return (
        <YStack f={1} ai="center" jc="center">
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{ width: '90%', height: '70%' }, animatedStyle]}>
                    <Card elevate size="$4" bordered w="100%" h="100%" bg="$background">
                        <Card.Header padded>
                            <H4>{currentDraft.email_subject}</H4>
                            <Paragraph theme="alt2">From: {currentDraft.email_sender}</Paragraph>
                        </Card.Header>
                        <Card.Footer padded>
                            <YStack gap="$4">
                                <Text>{currentDraft.proposed_body}</Text>
                                <XStack jc="space-between">
                                    <Button icon={X} chromeless onPress={() => onSwipeComplete('left')}>Reject</Button>
                                    <Button icon={Check} chromeless onPress={() => onSwipeComplete('right')}>Approve</Button>
                                </XStack>
                            </YStack>
                        </Card.Footer>
                    </Card>
                </Animated.View>
            </GestureDetector>
        </YStack>
    )
}
