import { FieldStatus, FieldType } from './field'

// === Analytics ===
export type BookingStatusCount = {
  status: string
  count: number
}

export type RevenueStats = {
  total_revenue: number | string
  bookings_by_status: BookingStatusCount[]
}

// === Fields ===
export type CreateFieldBody = {
  name: string
  type: FieldType
  address: string
  price_per_hour: number
  field_number: number
  description?: string
  image_url?: string
  status?: FieldStatus
}

export type UpdateFieldBody = {
  name?: string
  type?: FieldType
  address?: string
  price_per_hour?: number
  field_number?: number
  description?: string
  image_url?: string
  status?: FieldStatus
}

// === Pricing Rules ===
export type CreatePricingRuleBody = {
  name: string
  start_time: string       // HH:mm
  end_time: string         // HH:mm
  price_per_hour: number
  days_of_week: string     // "1,2,3,4,5"
}

// === Services ===
export type Service = {
  service_id: number
  name: string
  price: number | string
  unit: string
  image_url: string | null
  status: string
}

export type CreateServiceBody = {
  name: string
  price: number
  unit: string
  image_url?: string
}

// === Users ===
export type AdminUser = {
  user_id: number
  full_name: string
  email: string
  phone_number: string
  role: 'USER' | 'ADMIN' | 'OWNER'
  status: string
  avatar_url: string | null
}
