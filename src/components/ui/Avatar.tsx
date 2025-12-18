'use client'

interface AvatarProps {
  initials: string
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({ initials, size = 'md' }: AvatarProps) {
  const sizeClasses: Record<string, string> = {
    sm: 'w-[24px] h-[24px] text-[10px]',
    md: 'w-[30px] h-[30px] text-[12px]',
    lg: 'w-[40px] h-[40px] text-[14px]',
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[#fef0e3] border-[1px] border-[#f27f09] flex items-center justify-center flex-shrink-0`}
    >
      <span className="font-['Montserrat'] font-normal text-[#f27f09]">
        {initials.toUpperCase()}
      </span>
    </div>
  )
}
