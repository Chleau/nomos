import React from 'react';

function VousEtesUnActeur({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Outer Ring Placeholder */}
          <div className="w-[88px] md:w-[120px] h-[88px] md:h-[120px] rounded-full border-[8px] border-[#f27f09]/20 border-t-[#f27f09] rotate-45"></div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Inner Content */}
        <div className="bg-[#fef0e3] rounded-full w-[54px] md:w-[80px] h-[54px] md:h-[80px] flex items-center justify-center">
          <span className="text-[30px] md:text-[40px]">🙂</span>
        </div>
      </div>
    </div>
  );
}

export default function Acteur({ className, message = "Vous êtes un acteur engagé pour votre commune" }: { className?: string; message?: string }) {
  return (
    <div className={className}>
      <VousEtesUnActeur className="relative shrink-0 w-[140px] h-[140px]" />
      <div className="flex items-center justify-center w-full mt-0 md:mt-8">
        <p className="font-['Montserrat'] font-semibold text-[#053f5c] text-[14px] md:text-[24px] leading-[20px] md:leading-[36px] text-center w-[215px] md:w-[370px]">
          {message}
        </p>
      </div>
    </div>
  );
}
