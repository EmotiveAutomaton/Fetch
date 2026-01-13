import { getServiceUrl } from './discovery'

export interface ChatResponse {
    response: string
    model_used: string
}

export const api = {
    chat: async (message: string, mode: 'public' | 'private'): Promise<ChatResponse> => {
        const baseUrl = getServiceUrl()
        if (!baseUrl) {
            throw new Error('Fetch Server not found. Please ensure the server is running on the same network.')
        }

        try {
            const response = await fetch(`${baseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, mode }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Server Error: ${response.status} - ${errorText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('API Call Failed:', error)
            throw error
        }
    },

    getPendingDrafts: async (): Promise<any[]> => {
        const baseUrl = getServiceUrl()
        if (!baseUrl) throw new Error('Fetch Server not found')
        const response = await fetch(`${baseUrl}/drafts/pending`)
        if (!response.ok) throw new Error('Failed to fetch drafts')
        return await response.json()
    },

    handleDraftAction: async (id: string, action: 'approve' | 'reject') => {
        const baseUrl = getServiceUrl()
        if (!baseUrl) throw new Error('Fetch Server not found')
        const response = await fetch(`${baseUrl}/drafts/${id}/${action}`, { method: 'POST' })
        if (!response.ok) throw new Error('Failed to update draft')
        return await response.json()
    }
}
