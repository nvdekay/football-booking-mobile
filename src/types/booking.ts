export type TimeSlot = {
  start: string
  end: string
  price: number
  status: 'BOOKED' | 'AVAILABLE'
  is_peak: boolean
}

export type AvailabilityResponse = {
  date: string
  slots: TimeSlot[]
}

export type Service = {
  service_id: number
  name: string
  price: number
  unit: string
  image_url: string | null
  status: string
}

export type ServiceSelection = {
  id: number
  quantity: number
}

export type CreateBookingBody = {
  field_id: number
  date: string
  start_time: string
  duration: number
  service_ids?: ServiceSelection[]
}

export type CreateBookingResponse = {
  booking_id: number
  total_price: number
  deposit_amount: number
}

export type PaymentMethod = 'WALLET'

export type InitiatePaymentBody = {
  booking_id: number
  method: PaymentMethod
}

export type InitiatePaymentResponse = {
  status: 'SUCCESS' | 'PENDING'
  message?: string
  payment_url?: string
}

export type Booking = {
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
  field_name: string
  address: string
  created_at: string
}
