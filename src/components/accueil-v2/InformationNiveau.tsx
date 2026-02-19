import React from 'react';

type InformationNiveauProps = {
  className?: string;
  niveau?: string;
};

export default function InformationNiveau({ className, niveau = "Apprenti Signaleur" }: InformationNiveauProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-center py-[2px] mb-6">
        <h2 className="font-['Montserrat'] font-semibold text-[#053f5c] text-[18px] md:text-[24px] leading-[28px] md:leading-[36px]">
          Votre niveau
        </h2>
      </div>
      <div className="bg-[#ecf5f8] border-2 border-[#053f5c] flex items-center justify-center p-[24px] rounded-[14px] md:rounded-[32px] w-[88px] md:w-[140px] h-[88px] md:h-[140px] mx-auto mb-6">
        <div className="bg-white rounded-full w-[64px] md:w-[100px] h-[64px] md:h-[100px] aspect-square flex items-center justify-center ring-3 ring-inset ring-[#F27F09]">
          <span className="text-[30px] md:text-[40px]">👋</span>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <p className="font-['Montserrat'] md:font-['Poppins'] font-medium text-[#053f5c] text-[14px] md:text-[16px] text-center">
          {niveau}
        </p>
      </div>
    </div>
  );
}
