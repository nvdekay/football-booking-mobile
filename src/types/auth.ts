export type User = {
    id: number
    full_name: string
    email: string
    phone_number: string
    role: string
    avatar_url: string | null
    wallet_balance: number
    loyalty_points: number
}

export type RegisterBody = {
    full_name: string
    email: string
    password: string
    phone_number: string
}

export type LoginBody = {
    email?: string
    phone_number?: string
    password: string
}

export type AuthResponse<T = any> = {
    success: boolean
    message: string
    data: T
}

export type LoginResponseData = {
    token: string
    user: User
}

export type UpdateProfileBody = {
    full_name?: string
    phone_number?: string
    avatar_url?: string
}
