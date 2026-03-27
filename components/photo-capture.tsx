'use client'

import { useRef } from 'react'
import { Camera, X } from 'lucide-react'
import Image from 'next/image'

interface Props {
  photo: string | null
  onChange: (photo: string | null) => void
}

export function PhotoCapture({ photo, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result === 'string') {
        onChange(result)
      }
    }
    reader.readAsDataURL(file)

    // Reset the input so the same file can be re-selected if needed
    e.target.value = ''
  }

  if (photo) {
    return (
      <div className="relative">
        <Image
          src={photo}
          alt="Door photo"
          width={400}
          height={240}
          className="w-full rounded-xl object-cover"
          style={{ maxHeight: '200px', objectFit: 'cover' }}
          unoptimized
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur hover:text-destructive transition-colors"
          aria-label="Remove photo"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary py-3 text-sm text-muted-foreground hover:border-[#22c55e]/40 hover:text-foreground transition-colors"
      >
        <Camera size={16} />
        Take Photo (optional)
      </button>
    </>
  )
}
