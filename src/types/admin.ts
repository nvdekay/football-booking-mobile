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
export type ServiceStatus = 'AVAILABLE' | 'UNAVAILABLE'

export type Service = {
  service_id: number
  name: string
  price: number | string
  unit: string
  image_url: string | null
  status: ServiceStatus
}

export type CreateServiceBody = {
  name: string
  price: number
  unit: string
  image_url?: string
}

export type UpdateServiceBody = {
  name?: string
  price?: number
  unit?: string
  image_url?: string
  status?: ServiceStatus
}

// === Bookings ===
export type BookingStatus = 'PENDING_PAYMENT' | 'DEPOSIT_PAID' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED'
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED'

export type BookingServiceDetail = {
  booking_service_id: number
  service_id: number
  quantity: number
  price_at_booking: number
  service_name: string
  unit: string
}

export type AdminBookingDetail = AdminBooking & {
  services: BookingServiceDetail[]
  cancellation_reason: string | null
}

export type AdminBooking = {
  booking_id: number
  user_id: number
  field_id: number
  booking_date: string
  start_time: string
  end_time: string
  total_price: number
  deposit_amount: number
  status: string
  payment_status: string
  check_in_code: string
  check_in_time: string | null
  field_name: string
  address: string
  user_name: string
  user_phone: string
  created_at: string
}

// === Team Matchings ===
export type MatchingStatus = 'OPEN' | 'MATCHED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
export type MatchLevel = 'VUI_VE' | 'BAN_CHUYEN' | 'CHUYEN_NGHIEP'

export type AdminTeamMatching = {
  matching_id: number
  host_id: number
  field_id: number | null
  match_date: string
  start_time: string
  duration: number
  level: MatchLevel
  description: string | null
  status: MatchingStatus
  challenger_id: number | null
  host_confirmed: boolean
  challenger_confirmed: boolean
  cancelled_by: number | null
  cancellation_reason: string | null
  host_name: string
  host_phone: string
  field_name: string | null
  field_address: string | null
  created_at: string
}

export type AdminMatchingFilters = {
  status?: MatchingStatus
  date?: string
  level?: MatchLevel
  field_id?: number
  page?: number
  limit?: number
}

export type AdminMatchingPaginatedResponse = {
  items: AdminTeamMatching[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
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
