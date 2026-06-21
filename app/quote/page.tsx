import { Suspense } from 'react'
import { QuoteTool } from './quote-tool'

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center text-muted-foreground">Loading…</div>}>
      <QuoteTool />
    </Suspense>
  )
}
