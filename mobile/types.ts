export interface Draft {
    id: string
    email_id: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT'
    proposed_body: string
    reasoning_trace?: string
    created_at: string
    sender?: string
    subject?: string
}
