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
    <div className={`bg-[#f7ad19] w-full px-4 py-5 md:py-5 md:px-4 flex items-center justify-center mb-4 md:mb-8 h-32 md:h-auto ${className}`}>

      <p
        className="flex-1 text-[16px] md:text-[20px] leading-tight md:leading-[32px] text-[#242a35] text-center whitespace-pre-wrap"
        style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
      >
        {message}
      </p>
    </div>
  );
}
