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
}

export default function CardIncident({
  image,
  title,
  label,
  date,
  username,
  description,
  onClick,
}: CardIncidentProps) {
  return (
    <div
      onClick={onClick}
      className="flex bg-white rounded-[24px] h-[200px] overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Image section */}
      {image && (
        <div className="w-[189px] h-auto bg-gray-300 flex-shrink-0">
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
        <h3 className="font-['Poppins'] font-medium text-[20px] text-[#242a35] leading-[24px]">
          {title}
        </h3>

        {/* Info row - badge, date, and user */}
        <div className="flex items-center gap-5">
          <DotBadge label={label} color="red" />
          <span className="text-[12px] font-['Montserrat'] font-normal text-[#64748b]" suppressHydrationWarning>
            Déclaré le {date}
          </span>
          <span className="ml-auto text-[12px] font-['Montserrat'] font-medium text-[#242a35]">
            {username}
          </span>
        </div>

        {/* Description with ellipsis */}
        <p className="text-[14px] font-['Montserrat'] font-normal text-[#475569] line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  )
}
