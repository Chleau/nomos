import React from 'react';

type ProgressBarProps = {
  className?: string;
  current: number;
  total: number;
};

export default function ProgressBar({ className, current, total }: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);
  
  return (
    <div className={className}>
      <div className="bg-[#e9e9e9] flex flex-col h-[12px] items-start overflow-hidden relative rounded-full w-full">
        <div 
          className="bg-[#F27F09] h-[12px] rounded-full transition-all duration-300" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex h-[16px] items-center justify-between px-[4px] mt-1 w-full">
        <span className="font-['Poppins'] text-[#787878] text-[12px]">
          Vers le niveau suivant
        </span>
        <span className="font-['Poppins'] font-semibold text-[#f27f09] text-[12px]">
          {current}/{total}
        </span>
      </div>
    </div>
  );
}
