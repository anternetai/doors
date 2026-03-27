'use client'

import dynamic from 'next/dynamic'
import type { TerritoryMapInnerProps } from './territory-map-inner'

const TerritoryMapInner = dynamic(() => import('./territory-map-inner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-card">
      <div className="text-sm text-muted-foreground">Loading map…</div>
    </div>
  ),
})

export function TerritoryMap(props: TerritoryMapInnerProps) {
  return <TerritoryMapInner {...props} />
}
