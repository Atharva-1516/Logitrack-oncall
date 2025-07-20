export interface Site {
  id: string
  name: string
  lat: number
  lng: number
  first_visited: string
}

export interface Job {
  id: string
  user_id?: string
  site_id: string | null
  start_time: string
  end_time?: string | null
  travel_km?: number | null
  travel_time?: number | null
  fuel_cost?: number | null
  work_summary?: string | null
  created_at: string
  site?: Site
}

export interface JobFormData {
  siteName: string
  workSummary: string
  fuelEfficiency: number
  fuelPrice: number
} 