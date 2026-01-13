import { YStack, XStack, Text, Button, Card, H3, Paragraph, AnimatePresence } from 'tamagui'
import { useState } from 'react'
import { Draft } from '../types'

interface CardStackProps {
    drafts: Draft[]
    onApprove: (id: string) => void
    onReject: (id: string) => void
}

export function CardStack({ drafts, onApprove, onReject }: CardStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    if (currentIndex >= drafts.length) {
        return (
            <YStack f={1} ai="center" jc="center">
                <Text>No more drafts!</Text>
            </YStack>
        )
    }

    const currentDraft = drafts[currentIndex]

    const handleApprove = () => {
        onApprove(currentDraft.id)
        setCurrentIndex(prev => prev + 1)
    }

    const handleReject = () => {
        onReject(currentDraft.id)
        setCurrentIndex(prev => prev + 1)
    }

    return (
        <YStack f={1} ai="center" jc="center" p="$4">
            <Card
                elevate
                bordered
                w="100%"
                h={500}
                scale={0.9}
                hoverStyle={{ scale: 0.925 }}
                pressStyle={{ scale: 0.875 }}
                animation="bouncy"
            >
                <Card.Header padded>
                    <H3>{currentDraft.subject || 'No Subject'}</H3>
                    <Paragraph theme="alt2">{currentDraft.sender || 'Unknown Sender'}</Paragraph>
                </Card.Header>
                <Card.Footer padded>
                    <XStack f={1} />
                </Card.Footer>
                <Card.Background>
                    {/* Background content if needed */}
                </Card.Background>
                <YStack p="$4" f={1}>
                    <Paragraph numberOfLines={10}>{currentDraft.proposed_body}</Paragraph>
                    {currentDraft.reasoning_trace && (
                        <Paragraph theme="alt2" mt="$2" size="$2">
                            Reasoning: {currentDraft.reasoning_trace}
                        </Paragraph>
                    )}
                </YStack>
            </Card>

            <XStack mt="$4" space="$4">
                <Button theme="red" onPress={handleReject} size="$5">Reject</Button>
                <Button theme="green" onPress={handleApprove} size="$5">Approve</Button>
            </XStack>
        </YStack>
    )
}
