'use client'

interface DotBadgeProps {
  label: string
  color?: 'red' | 'orange' | 'green' | 'yellow' | 'blue'
}

export default function DotBadge({ label, color = 'red' }: DotBadgeProps) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
  }

  return (
    <div className="flex items-center gap-[6px]">
      <div className={`w-[8px] h-[8px] rounded-full ${colorClasses[color]}`} />
      <span className="text-[12px] font-['Montserrat'] font-normal text-[#f27f09]">
        {label}
      </span>
    </div>
  )
}
