export interface CustomerLocation {
  id: number
  customer_id: number
  location_type: 'home' | 'work' | 'other'
  address: string
  map_url: string
  latitude?: number
  longitude?: number
  is_primary: number
}
