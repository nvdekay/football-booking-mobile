export type FieldType = '5' | '7' | '11'

export type Field = {
  field_id: number
  name: string
  type: FieldType
  price_per_hour: string
  image_url: string | null
  description: string
  address: string
  status: string
  field_number: number
  rating_avg: string
  total_reviews: number
  latitude: number | null
  longitude: number | null
  thumbnail: string | null
  distance?: number
}

export type FieldSearchParams = {
  keyword?: string
  type?: FieldType
  min_price?: number
  max_price?: number
  rating?: number
  lat?: number
  long?: number
  sort_by?: string
}

export type PricingRule = {
  rule_id: number
  field_id: number
  name: string
  start_time: string
  end_time: string
  price_per_hour: number
  days_of_week: string
  is_active: boolean
}

export type FieldDetail = Field & {
  images: string[]
  pricing_rules: PricingRule[]
}
