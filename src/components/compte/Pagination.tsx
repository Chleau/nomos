'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = '' 
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M12.5 15L7.5 10L12.5 5" stroke={currentPage === 1 ? "#D1D2D5" : "#5B5D62"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="flex items-center gap-3">
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <div
                key={`ellipsis-${index}`}
                className="bg-white border border-[#e7eaed] rounded-md flex items-center justify-center p-2 w-8 h-8"
              >
                <span 
                  className="text-[16px] text-[#475569] leading-[24px]"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  ...
                </span>
              </div>
            );
          }
          
          const pageNum = page as number;
          const isActive = pageNum === currentPage;
          
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`border border-[#e7eaed] rounded-md flex items-center justify-center p-2 w-8 h-8 ${
                isActive 
                  ? 'bg-[#f27f09]' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <span 
                className={`text-[16px] leading-[24px] ${
                  isActive ? 'text-[#e2e8f0]' : 'text-[#475569]'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {pageNum}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 15L12.5 10L7.5 5" stroke={currentPage === totalPages ? "#D1D2D5" : "#5B5D62"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
