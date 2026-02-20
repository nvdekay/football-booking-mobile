export type TransactionType = 'PAYMENT' | 'REFUND' | 'DEPOSIT'

export type WalletTransaction = {
    id: number
    user_id: number
    amount: number
    type: TransactionType
    description: string
    created_at: string
}

export type TopupBody = {
    amount: number
    payment_method: 'VNPAY' | 'MOMO'
}

export type TopupResponse = {
    payment_id: number
    payment_url: string
}
