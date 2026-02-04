'use client';

import React from 'react';

interface CardLoiProps {
  className?: string;
  title?: string;
  link?: string;
  badge?: string;
  hasIcon?: boolean;
  onCardClick?: () => void;
  onLinkClick?: (e: React.MouseEvent) => void;
}

export default function CardLoi({ 
  className = '',
  title = "LOI organique n° 2022-400 du 21 mars 2022 visant à renforcer le rôle du Défenseur des droits en matière de signalement",
  link = "Lire plus",
  badge = "Text",
  hasIcon = true,
  onCardClick,
  onLinkClick
}: CardLoiProps) {
  return (
    <div 
      className={`bg-white border border-[#e7eaed] rounded-[24px] overflow-hidden h-[172px] flex items-center justify-between ${className}`}
      onClick={onCardClick}
    >
      <div className="flex-1 h-full flex flex-col justify-between px-8 py-4">
        <div className="flex flex-col gap-5">
          <p 
            className="text-[14px] text-[#242a35] leading-normal overflow-hidden"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {title}
          </p>
          <div className="bg-[#e7eaed] border border-[#475569] rounded-lg px-2 py-1 inline-flex self-start items-center justify-center">
            <p 
              className="text-[16px] text-[#64748b] leading-[24px]"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {badge}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full">
          {hasIcon && (
            <div className="bg-[#f5fcfe] rounded flex items-center justify-center p-[6px]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 2H10V10H2V2Z" fill="#64748b"/>
                <path d="M12 2H18V8H12V2Z" fill="#64748b"/>
                <path d="M2 12H8V18H2V12Z" fill="#64748b"/>
                <path d="M12 10H18V18H12V10Z" fill="#64748b"/>
              </svg>
            </div>
          )}
          <p 
            className="flex-1 text-[14px] text-[#f27f09] text-right cursor-pointer hover:underline"
            onClick={onLinkClick}
          >
            {link}
          </p>
        </div>
      </div>
    </div>
  );
}
