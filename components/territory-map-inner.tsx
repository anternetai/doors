'use client'

import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import type { TerritoryDoor } from '@/lib/types'

// ---- helpers ----------------------------------------------------------------

function getDoorColor(door: TerritoryDoor): string {
  if (door.visits.length === 0) return '#6b7280' // gray — not visited
  const latest = door.visits[door.visits.length - 1]
  if (latest.not_interested) return '#ef4444' // red
  if (latest.closed || latest.pitched) return '#22c55e' // green
  if (!latest.answered) return '#6b7280' // gray — no answer
  return '#6b7280'
}

// ---- proximity helpers ------------------------------------------------------

const EARTH_RADIUS_M = 6371000

function haversineMeters(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ---- Locate Me button -------------------------------------------------------

function LocateButton({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void
}) {
  const map = useMap()

  function handleClick() {
    map.locate({ setView: true, maxZoom: 18 })
    map.once('locationfound', (e) => {
      onLocate(e.latlng.lat, e.latlng.lng)
    })
  }

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: 10, marginRight: 10 }}>
      <div className="leaflet-control">
        <button
          onClick={handleClick}
          style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#22c55e',
            fontSize: 18,
          }}
          title="Locate me"
        >
          ⊕
        </button>
      </div>
    </div>
  )
}

// ---- Map events handler -----------------------------------------------------

function MapClickHandler({
  doors,
  onNewDoor,
  onRevisit,
}: {
  doors: TerritoryDoor[]
  onNewDoor: (lat: number, lng: number) => void
  onRevisit: (door: TerritoryDoor) => void
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      // Check for nearby door within 20m
      const nearby = doors.find(
        (d) => haversineMeters(lat, lng, d.lat, d.lng) <= 20
      )
      if (nearby) {
        onRevisit(nearby)
      } else {
        onNewDoor(lat, lng)
      }
    },
  })
  return null
}

// ---- Map position autosave --------------------------------------------------

function MapMoveHandler({
  onMove,
}: {
  onMove: (lat: number, lng: number, zoom: number) => void
}) {
  const map = useMapEvents({
    moveend() {
      const center = map.getCenter()
      onMove(center.lat, center.lng, map.getZoom())
    },
  })
  return null
}

// ---- Props ------------------------------------------------------------------

export interface TerritoryMapInnerProps {
  center: [number, number]
  zoom: number
  doors: TerritoryDoor[]
  onNewDoor: (lat: number, lng: number) => void
  onDoorClick: (door: TerritoryDoor) => void
  onRevisit: (door: TerritoryDoor) => void
  onMapMove: (lat: number, lng: number, zoom: number) => void
}

// ---- Main component ---------------------------------------------------------

export default function TerritoryMapInner({
  center,
  zoom,
  doors,
  onNewDoor,
  onDoorClick,
  onRevisit,
  onMapMove,
}: TerritoryMapInnerProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler
        doors={doors}
        onNewDoor={onNewDoor}
        onRevisit={onRevisit}
      />

      <MapMoveHandler onMove={onMapMove} />

      <LocateButton onLocate={(lat, lng) => onMapMove(lat, lng, 18)} />

      {doors.map((door) => {
        const color = getDoorColor(door)
        const hasMultipleVisits = door.visits.length > 1

        return (
          <CircleMarker
            key={door.id}
            center={[door.lat, door.lng]}
            radius={8}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.85,
              color: hasMultipleVisits ? '#ffffff' : 'transparent',
              weight: hasMultipleVisits ? 1.5 : 0,
            }}
            eventHandlers={{
              click(e) {
                // Stop propagation so the map-level click handler doesn't also fire
                e.originalEvent.stopPropagation()
                onDoorClick(door)
              },
            }}
          />
        )
      })}
    </MapContainer>
  )
}
