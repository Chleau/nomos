import React from 'react'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemCount?: number
    totalItems?: number
}

export default function Pagination({ currentPage, totalPages, onPageChange, itemCount, totalItems }: PaginationProps) {
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 4) {
                // Start: 1 2 3 4 5 ... last
                for (let i = 1; i <= 5; i++) pages.push(i)
                pages.push('...')
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 3) {
                // End: 1 ... last-4 last-3 last-2 last-1 last
                pages.push(1)
                pages.push('...')
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
            } else {
                // Middle: 1 ... current-1 current current+1 ... last
                pages.push(1)
                pages.push('...')
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push('...')
                pages.push(totalPages)
            }
        }
        return pages
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                &lt;
            </button>

            {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                    {page === '...' ? (
                        <span className="text-slate-400 px-1">...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(page as number)}
                            className={`
                w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors
                ${currentPage === page
                                    ? 'bg-[#f27f09] text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-100'}
              `}
                        >
                            {page}
                        </button>
                    )}
                </React.Fragment>
            ))}

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                &gt;
            </button>

            {itemCount !== undefined && totalItems !== undefined && (
                <span className="hidden lg:inline-block ml-6 text-sm text-slate-500 font-medium whitespace-nowrap">
                    {itemCount} sur {totalItems} résultats
                </span>
            )}
        </div>
    )
}
