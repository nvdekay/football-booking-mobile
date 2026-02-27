export type MatchLevel = 'VUI_VE' | 'BAN_CHUYEN' | 'CHUYEN_NGHIEP'
export type MatchStatus = 'OPEN' | 'MATCHED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'

export type TeamMatching = {
    matching_id: number
    host_id: number
    host_name: string
    host_phone: string
    field_id: number | null
    field_name: string | null
    field_address: string | null
    match_date: string
    start_time: string
    duration_minutes: number
    level: MatchLevel
    description: string | null
    status: MatchStatus
    host_confirmed: boolean
    challenger_confirmed: boolean
    created_at: string
}

export type MatchParticipant = {
    participant_id: number
    user_id: number
    full_name: string
    phone_number: string
    role: 'HOST' | 'CHALLENGER'
    confirmed: boolean
    joined_at: string
}

export type TeamMatchingDetail = TeamMatching & {
    participants: MatchParticipant[]
}

export type CreateMatchingBody = {
    match_date: string
    start_time: string
    duration_minutes?: number
    field_id?: number
    level: MatchLevel
    description?: string
}

export type MatchingSearchParams = {
    date?: string
    level?: MatchLevel
    page?: number
    limit?: number
}

export type PaginatedResponse<T> = {
    items: T[]
    pagination: {
        page: number
        limit: number
        total: number
        total_pages: number
    }
}
