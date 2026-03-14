'use client'

import DotBadge from './DotBadge'

interface CardIncidentProps {
  image?: string
  title: string
  label: string
  date: string
  username: string
  description: string
  onClick?: () => void
  backgroundColor?: string
  color?: 'red' | 'orange' | 'green' | 'yellow' | 'blue' | 'gray'
}

export default function CardIncident({
  image,
  title,
  label,
  date,
  username,
  description,
  onClick,
  backgroundColor = 'bg-white',
  color
}: CardIncidentProps) {
  // Déterminer la couleur dynamiquement si elle n'est pas fournie
  const getBadgeColor = () => {
    if (color) return color
    switch (label) {
      case 'Urgent': return 'red'
      case 'Résolu': return 'green'
      case 'En cours': return 'orange'
      case 'En attente': return 'gray'
      default: return 'gray'
    }
  }

  const badgeColor = getBadgeColor()

  return (
    <div
      onClick={onClick}
      className={`flex w-full h-[177px] ${backgroundColor} rounded-[24px] overflow-hidden border border-[#e7eaed] cursor-pointer hover:bg-[#f1f5f9] transition-colors`}
    >
      {/* Image section */}
      {image && (
        <div className="w-[114px] md:w-[189px] h-full bg-gray-300 flex-shrink-0">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content section */}
      <div className="flex-1 p-[20px] flex flex-col gap-[16px]">
        {/* Title */}
        <h3 className="font-['Poppins'] font-medium text-[16px] md:text-[20px] text-[#242a35] leading-[24px]">
          {title}
        </h3>

        {/* Badge and date row */}
        <div className="flex items-center gap-[12px]">
          <DotBadge label={label} color={badgeColor} />
          <span className="text-[12px] font-['Montserrat'] font-normal text-[#64748b]" suppressHydrationWarning>
            Déclaré le {date}
          </span>
        </div>

        {/* Username row */}
        <div>
          <span className="text-[12px] md:text-[14px] font-['Montserrat'] font-semibold text-[#242a35]">
            {username}
          </span>
        </div>

        {/* Description with ellipsis */}
        <p className="text-[12px] md:text-[14px] font-['Montserrat'] font-normal text-[#242A35] line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  )
}
