export interface DoorVisit {
  date: string
  time?: string
  answered: boolean
  pitched?: boolean
  closed?: boolean
  not_interested?: boolean
  notes?: string
  revenue?: number
  photo?: string
  audioUrl?: string
}

export interface TerritoryDoor {
  id: string
  user_id: string
  territory_id: string
  lat: number
  lng: number
  visits: DoorVisit[]
  status: string
  total_visits: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Territory {
  id: string
  user_id: string
  name: string
  address: string | null
  center_lat: number | null
  center_lng: number | null
  zoom_level: number | null
  created_at: string
}

export interface TerritoryKpis {
  total_doors: number
  doors_answered: number
  doors_pitched: number
  doors_closed: number
  doors_not_interested: number
  contact_rate: number
  pitch_rate: number
  close_rate: number
  total_revenue: number
  avg_revenue_per_door: number
}

export interface TerritoryWithKpis extends Territory {
  kpis: TerritoryKpis
}

export interface Recommendation {
  type: 'warning' | 'info' | 'success'
  title: string
  message: string
}
