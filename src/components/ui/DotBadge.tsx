'use client'

interface DotBadgeProps {
  label: string
  color?: 'red' | 'orange' | 'green' | 'yellow' | 'blue' | 'gray'
}

export default function DotBadge({ label, color }: DotBadgeProps) {
  const colorClasses: Record<string, string> = {
    red: '!bg-red-500',
    orange: '!bg-[#f27f09]',
    green: '!bg-green-500',
    yellow: '!bg-yellow-500',
    blue: '!bg-blue-500',
    gray: '!bg-gray-400'
  }

  const textClasses: Record<string, string> = {
    red: '!text-red-500',
    orange: '!text-[#f27f09]',
    green: '!text-green-500',
    yellow: '!text-yellow-500',
    blue: '!text-blue-500',
    gray: '!text-gray-400'
  }

  const activeColor = color || 'orange'

  return (
    <div className="flex items-center gap-[6px]">
      <div className={`w-[8px] h-[8px] rounded-full ${colorClasses[activeColor]}`} />
      <span className={`text-[12px] font-['Montserrat'] font-normal ${textClasses[activeColor]}`}>
        {label}
      </span>
    </div>
  )
}
