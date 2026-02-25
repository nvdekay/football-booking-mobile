export type TransactionType = 'PAYMENT' | 'REFUND' | 'DEPOSIT'

export type WalletTransaction = {
    transaction_id: number
    user_id: number
    amount: number
    type: TransactionType
    description: string
    created_at: string
    // Enriched from booking/field JOIN
    booking_date?: string | null
    start_time?: string | null
    end_time?: string | null
    field_name?: string | null
    field_address?: string | null
}

export type TopupBody = {
    amount: number
    payment_method: 'VNPAY' | 'MOMO'
}

export type TopupResponse = {
    payment_id: number
    payment_url: string
}
