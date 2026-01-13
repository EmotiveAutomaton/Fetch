import { View, Alert, Dimensions, StyleSheet, Pressable } from 'react-native'
import { YStack, XStack, Text, Card, H3, Paragraph, Button, Spinner } from 'tamagui'
import { Check, X, RefreshCw } from '@tamagui/lucide-icons'
import { useState, useEffect, useCallback } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    withTiming,
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { api } from '../../lib/api'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25

interface Draft {
    id: string
    email_subject: string
    email_sender: string
    proposed_body: string
    reasoning_trace: string | null
}

export default function DeckScreen() {
    const insets = useSafeAreaInsets()
    const [drafts, setDrafts] = useState<Draft[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const translateX = useSharedValue(0)
    const translateY = useSharedValue(0)
    const rotate = useSharedValue(0)

    const fetchDrafts = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const pending = await api.getPendingDrafts()
            setDrafts(pending)
        } catch (e: any) {
            setError(e.message || 'Failed to load drafts')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchDrafts()
    }, [fetchDrafts])

    const currentDraft = drafts[0]

    const handleSwipe = async (action: 'approve' | 'reject') => {
        if (!currentDraft || processing) return
        setProcessing(true)
        try {
            await api.handleDraftAction(currentDraft.id, action)
            setDrafts((prev) => prev.slice(1))
        } catch (e: any) {
            Alert.alert('Error', e.message)
        } finally {
            setProcessing(false)
            translateX.value = withSpring(0)
            translateY.value = withSpring(0)
            rotate.value = withSpring(0)
        }
    }

    const onSwipeComplete = (direction: 'left' | 'right') => {
        handleSwipe(direction === 'right' ? 'approve' : 'reject')
    }

    const gesture = Gesture.Pan()
        .onUpdate((e) => {
            translateX.value = e.translationX
            translateY.value = e.translationY * 0.5
            rotate.value = (e.translationX / SCREEN_WIDTH) * 15
        })
        .onEnd((e) => {
            if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
                const direction = e.translationX > 0 ? 'right' : 'left'
                translateX.value = withTiming(direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, { duration: 200 })
                runOnJS(onSwipeComplete)(direction)
            } else {
                translateX.value = withSpring(0)
                translateY.value = withSpring(0)
                rotate.value = withSpring(0)
            }
        })

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { rotate: `${rotate.value}deg` },
        ],
    }))

    const approveOpacity = useAnimatedStyle(() => ({
        opacity: Math.max(0, translateX.value / SWIPE_THRESHOLD),
    }))

    const rejectOpacity = useAnimatedStyle(() => ({
        opacity: Math.max(0, -translateX.value / SWIPE_THRESHOLD),
    }))

    // Empty state
    if (!loading && drafts.length === 0) {
        return (
            <YStack f={1} ai="center" jc="center" p="$4" pt={insets.top} bg="$background">
                <Text fontSize="$8" mb="$4">🐕</Text>
                <H3 ta="center" mb="$2">All Clear!</H3>
                <Paragraph ta="center" color="$gray10" mb="$4">
                    No pending drafts. Archimedes has fetched everything.
                </Paragraph>
                <Button icon={RefreshCw} onPress={fetchDrafts}>
                    Refresh
                </Button>
            </YStack>
        )
    }

    // Loading state
    if (loading) {
        return (
            <YStack f={1} ai="center" jc="center" pt={insets.top} bg="$background">
                <Spinner size="large" />
                <Text mt="$4">Fetching drafts...</Text>
            </YStack>
        )
    }

    // Error state
    if (error) {
        return (
            <YStack f={1} ai="center" jc="center" p="$4" pt={insets.top} bg="$background">
                <Text color="$red10" ta="center" mb="$4">{error}</Text>
                <Button icon={RefreshCw} onPress={fetchDrafts}>
                    Retry
                </Button>
            </YStack>
        )
    }

    return (
        <YStack f={1} pt={insets.top} bg="$background">
            {/* Header */}
            <XStack p="$4" jc="space-between" ai="center">
                <Text fontSize="$6" fontWeight="bold">The Deck</Text>
                <Text color="$gray10">{drafts.length} remaining</Text>
            </XStack>

            {/* Card Stack */}
            <YStack f={1} ai="center" jc="center" p="$4">
                <GestureDetector gesture={gesture}>
                    <Animated.View style={[styles.cardContainer, animatedStyle]}>
                        {/* Swipe Indicators */}
                        <Animated.View style={[styles.indicator, styles.approveIndicator, approveOpacity]}>
                            <Check size={32} color="white" />
                            <Text color="white" fontWeight="bold">APPROVE</Text>
                        </Animated.View>
                        <Animated.View style={[styles.indicator, styles.rejectIndicator, rejectOpacity]}>
                            <X size={32} color="white" />
                            <Text color="white" fontWeight="bold">REJECT</Text>
                        </Animated.View>

                        <Card elevate bordered p="$4" w="100%">
                            <Card.Header>
                                <H3 numberOfLines={1}>{currentDraft.email_subject}</H3>
                                <Paragraph color="$gray10" numberOfLines={1}>
                                    From: {currentDraft.email_sender}
                                </Paragraph>
                            </Card.Header>

                            <YStack mt="$4" gap="$2">
                                <Text fontWeight="bold" color="$blue10">Proposed Reply:</Text>
                                <Paragraph numberOfLines={6}>
                                    {currentDraft.proposed_body}
                                </Paragraph>
                            </YStack>

                            {currentDraft.reasoning_trace && (
                                <YStack mt="$4" p="$3" bg="$gray2" br="$3">
                                    <Text fontSize="$2" color="$gray11" fontStyle="italic">
                                        💭 {currentDraft.reasoning_trace}
                                    </Text>
                                </YStack>
                            )}
                        </Card>
                    </Animated.View>
                </GestureDetector>
            </YStack>

            {/* Action Buttons */}
            <XStack p="$4" gap="$4" jc="center">
                <Button
                    size="$5"
                    circular
                    bg="$red5"
                    icon={<X size={28} color="$red10" />}
                    onPress={() => handleSwipe('reject')}
                    disabled={processing}
                />
                <Button
                    size="$5"
                    circular
                    bg="$green5"
                    icon={<Check size={28} color="$green10" />}
                    onPress={() => handleSwipe('approve')}
                    disabled={processing}
                />
            </XStack>
        </YStack>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        width: SCREEN_WIDTH - 32,
        maxWidth: 400,
    },
    indicator: {
        position: 'absolute',
        top: 20,
        zIndex: 10,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        gap: 4,
    },
    approveIndicator: {
        right: 20,
        backgroundColor: '#22c55e',
    },
    rejectIndicator: {
        left: 20,
        backgroundColor: '#ef4444',
    },
})
