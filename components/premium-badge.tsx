interface Props {
  label?: string
}

export function PremiumBadge({ label = 'PRO' }: Props) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#FF6B35] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#0a0a0a] tracking-wide">
      {label}
    </span>
  )
}
