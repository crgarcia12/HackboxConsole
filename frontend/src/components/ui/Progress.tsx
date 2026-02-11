interface ProgressProps {
  value: number
  max: number
  className?: string
}

export function Progress({ value, max, className = '' }: ProgressProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0
  
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
      <div 
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )
}
