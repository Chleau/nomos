import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/solid';

type CardRaccourciProps = {
  className?: string;
  label?: string;
};

export default function CardRaccourci({ className, label = "Accédez aux lois mises en vigueur." }: CardRaccourciProps) {
  return (
    <div className={className}>
      <div className="bg-white border-2 border-transparent hover:bg-[#f1f5f9] transition-colors flex-1 relative rounded-[24px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.06)] w-full h-full min-h-[272px]">
        <div className="absolute inset-0 flex items-center justify-center px-[57px]">
          <p className="font-['Poppins'] font-medium text-[#053f5c] text-[30px] text-center w-full">
            {label}
          </p>
        </div>
        <div className="absolute bottom-[22px] right-[22px] w-[48px] h-[48px]">
          <div className="bg-[#f5fcfe] flex items-center justify-center rounded-full w-full h-full">
            <ChevronRightIcon className="w-6 h-6 text-[#053f5c]" />
          </div>
        </div>
      </div>
    </div>
  );
}
