/* eslint-disable @next/next/no-img-element */

/**
 * Doors brand components — using actual logo assets.
 * /logo.svg — full logo (icon + wordmark)
 * /icon.png — door-pin icon only
 * /wordmark.png — "doors" text only
 */

/** Door-pin icon only */
export function DoorsIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/icon.png"
      alt="Doors"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', width: size, height: size }}
    />
  )
}

/** Full logo — icon + wordmark from the real SVG */
export function DoorsLogo({ height = 28, className }: { height?: number; className?: string }) {
  return (
    <img
      src="/logo.svg"
      alt="Doors"
      className={className}
      style={{ height, width: 'auto', objectFit: 'contain' }}
    />
  )
}

/** Wordmark only — "doors" text from the real logo */
export function DoorsWordmark({ height = 24, className }: { height?: number; className?: string }) {
  return (
    <img
      src="/wordmark.png"
      alt="Doors"
      className={className}
      style={{ height, width: 'auto', objectFit: 'contain' }}
    />
  )
}
