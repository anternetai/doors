/**
 * Doors door-pin icon — matches the brand logo.
 * Green open door inside a map pin shape.
 */
export function DoorsIcon({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pin shape */}
      <path
        d="M32 78 C32 78 4 44 4 28 C4 12.536 16.536 0 32 0 C47.464 0 60 12.536 60 28 C60 44 32 78 32 78Z"
        fill="#22c55e"
      />
      {/* Door frame (white rectangle) */}
      <rect x="18" y="10" width="28" height="38" rx="2" fill="white" />
      {/* Open door (angled) */}
      <path
        d="M18 10 L18 48 L32 44 L32 14 Z"
        fill="#22c55e"
      />
      {/* Door knob */}
      <circle cx="30" cy="30" r="2.5" fill="white" />
    </svg>
  )
}

/**
 * Doors wordmark — lowercase "doors" text.
 * Uses the app's font. For use next to the icon.
 */
export function DoorsWordmark({ className }: { className?: string }) {
  return (
    <span
      className={className}
      style={{
        fontWeight: 800,
        letterSpacing: '-0.03em',
        lineHeight: 1,
      }}
    >
      doors
    </span>
  )
}

/**
 * Full logo — icon + wordmark together
 */
export function DoorsLogo({
  iconSize = 28,
  textSize = 'text-xl',
  className,
}: {
  iconSize?: number
  textSize?: string
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <DoorsIcon size={iconSize} />
      <DoorsWordmark className={`${textSize} text-foreground`} />
    </div>
  )
}
