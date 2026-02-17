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
}

export type FieldSearchParams = {
  keyword?: string
  type?: FieldType
  min_price?: number
  max_price?: number
  rating?: number
}
