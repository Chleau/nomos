import React from 'react';

function VousEtesUnActeur({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Outer Ring Placeholder */}
            <div className="w-[120px] h-[120px] rounded-full border-[8px] border-[#f27f09]/20 border-t-[#f27f09] rotate-45"></div>
          </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
         {/* Inner Content */}
         <div className="bg-[#fef0e3] rounded-full w-[80px] h-[80px] flex items-center justify-center">
            <span className="text-[40px]">🙂</span>
         </div>
      </div>
    </div>
  );
}

export default function Acteur({ className, message = "Vous êtes un acteur engagé pour votre commune" }: { className?: string; message?: string }) {
  return (
    <div className={className}>
      <VousEtesUnActeur className="relative shrink-0 w-[140px] h-[140px]" />
      <div className="flex items-center justify-center w-full mt-8">
        <p className="font-['Montserrat'] font-semibold text-[#053f5c] text-[24px] leading-[36px] text-center w-[370px]">
          {message}
        </p>
      </div>
    </div>
  );
}
