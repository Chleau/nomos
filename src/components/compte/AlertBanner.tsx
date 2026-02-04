'use client';

import React from 'react';

interface AlertBannerProps {
  message?: string;
  className?: string;
}

export default function AlertBanner({ 
  message = "⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage.",
  className = '' 
}: AlertBannerProps) {
  return (
    <div className={`bg-[#f7ad19] flex items-center justify-between px-[10px] py-5 w-full ${className}`}>
      <p 
        className="flex-1 text-[20px] leading-[32px] text-[#242a35] text-center whitespace-pre-wrap"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
      >
        {message}
      </p>
    </div>
  );
}
