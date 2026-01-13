import { YStack, Text, Button, Spinner } from 'tamagui'
import { Link, router } from 'expo-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { Deck } from '../../components/Deck'
import { X } from '@tamagui/lucide-icons'

export default function DeckScreen() {
    const queryClient = useQueryClient()

    const { data: drafts, isLoading, error } = useQuery({
        queryKey: ['drafts'],
        queryFn: api.getPendingDrafts,
        refetchInterval: 5000 // Poll every 5s for new drafts
    })

    const mutation = useMutation({
        mutationFn: ({ id, action }: { id: string, action: 'approve' | 'reject' }) =>
            api.handleDraftAction(id, action),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['drafts'] })
        }
    })

    const handleSwipeRight = (id: string) => {
        mutation.mutate({ id, action: 'approve' })
    }

    const handleSwipeLeft = (id: string) => {
        mutation.mutate({ id, action: 'reject' })
    }

    if (isLoading) {
        return (
            <YStack f={1} ai="center" jc="center" bg="$background">
                <Spinner size="large" color="$color" />
            </YStack>
        )
    }

    if (error) {
        return (
            <YStack f={1} ai="center" jc="center" bg="$background" p="$4">
                <Text color="$red10" mb="$4">Error loading drafts: {(error as Error).message}</Text>
                <Button onPress={() => router.back()}>Close</Button>
            </YStack>
        )
    }

    if (!drafts || drafts.length === 0) {
        return (
            <YStack f={1} ai="center" jc="center" bg="$background" p="$4">
                <Text fontSize="$6" mb="$4">No pending drafts! 🎉</Text>
                <Button onPress={() => router.back()}>Close</Button>
            </YStack>
        )
    }

    return (
        <YStack f={1} bg="$background" pt="$8">
            <Deck
                drafts={drafts}
                onSwipeRight={handleSwipeRight}
                onSwipeLeft={handleSwipeLeft}
            />
            <Button
                pos="absolute"
                top="$4"
                right="$4"
                size="$3"
                circular
                icon={X}
                onPress={() => router.back()}
            />
        </YStack>
    )
}

