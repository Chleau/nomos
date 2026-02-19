'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AlertBanner from '@/components/compte/AlertBanner';
import { ArrowTopRightOnSquareIcon, AdjustmentsVerticalIcon } from '@heroicons/react/24/outline';
import { useSearchLois } from '@/lib/hooks/useLois';
import Button from '@/components/ui/Button';
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown';

export default function LoisPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedThematique, setSelectedThematique] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    startDate: null,
    endDate: null,
    periodType: null,
    themes: []
  });
  const { data: allLois, isLoading, error } = useSearchLois(searchQuery);

  // Récupérer les thématiques uniques
  const thematiques = useMemo(() => {
    if (!allLois) return [];
    const uniqueThemes = [...new Set(allLois.map(loi => loi.thematique).filter(Boolean))];
    return uniqueThemes.sort();
  }, [allLois]);

  // Filtrer les lois par thématique et les filtres appliqués
  const lois = useMemo(() => {
    if (!allLois) return [];

    let filtered = allLois;

    // Filtrer par thématique sélectionnée (boutons à gauche)
    if (selectedThematique) {
      filtered = filtered.filter(loi => loi.thematique === selectedThematique);
    }

    // Filtrer par thématique depuis le dropdown
    if (filters.themes && filters.themes.length > 0) {
      filtered = filtered.filter(loi => filters.themes.includes(loi.thematique));
    }

    // Filtrer par période
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(loi => {
        const loiDate = new Date(loi.date_mise_a_jour);

        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          if (loiDate < startDate) return false;
        }

        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (loiDate > endDate) return false;
        }

        return true;
      });
    }

    return filtered;
  }, [allLois, selectedThematique, filters]);

  const ITEMS_PER_PAGE = 12;

  // Réinitialiser la page quand la recherche ou le filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedThematique, filters]);

  // Calcul de la pagination
  const totalPages = lois ? Math.ceil(lois.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLois = lois ? lois.slice(startIndex, endIndex) : [];

  // Générer les numéros de pages à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#f5fcfe] min-h-screen relative pb-20 md:pb-0">
      {/* Main Content - offset for sidebar */}
      <div className="flex flex-col">
        {/* Alert Banner */}
        <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />
      </div>

      <div className="container px-2.5 md:px-12 mb-6 md:mb-8">
        <h1 className="font-['Poppins'] font-semibold text-xl md:text-[36px] mb-6 text-center md:text-left">
          Dernières lois en vigueur
        </h1>
        {/* Barre de recherche */}
        <div className="relative mb-6">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        {/* Boutons de thématiques et filtres */}
        <div className="flex items-center gap-2 md:gap-3 mb-6 flex-wrap">
          <div className="hidden md:flex gap-3 flex-wrap">
            {thematiques.map((thematique) => (
              <button
                key={thematique}
                onClick={() => setSelectedThematique(selectedThematique === thematique ? null : thematique)}
                className={`px-2 h-[32px] flex items-center rounded-lg font-['Montserrat'] text-sm md:text-[16px] font-no transition-colors ${selectedThematique === thematique
                  ? 'bg-[#F27F09] text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {thematique}
              </button>
            ))}
          </div>
          <div className="ml-auto relative z-50">
            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <AdjustmentsVerticalIcon className="w-5 h-5" />
              <span className="font-['Montserrat'] text-[16px]">Filtres</span>
            </Button>
            <FilterDropdown
              isOpen={showFilterDropdown}
              onClose={() => setShowFilterDropdown(false)}
              onApply={(newFilters) => {
                setFilters(newFilters);
                setShowFilterDropdown(false);
              }}
              onClear={() => {
                setFilters({
                  startDate: null,
                  endDate: null,
                  periodType: null,
                  themes: []
                });
                setShowFilterDropdown(false);
              }}
              categories={thematiques}
            />
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement des lois...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Erreur lors du chargement des lois</p>
          </div>
        )}

        {!isLoading && !error && lois && lois.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune loi trouvée</p>
          </div>
        )}

        {!isLoading && !error && lois && lois.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-12">
              {currentLois.map((loi) => (
                <div key={loi.id} className="bg-white rounded-3xl border border-[#E7EAED] p-4 md:p-6 h-[172px] w-full flex flex-col justify-between">
                  <div className="flex flex-col gap-3 md:gap-[20px]">
                    <h2 className="font-['Montserrat'] text-normal text-sm md:text-[14px] line-clamp-2">{loi.titre}</h2>
                    <div className="flex items-center gap-[8px]">
                      <span className="w-[37px] h-[24px] border border-[#475569] bg-[#E7EAED] text-[#64748B] px-[4px] py-[2px] rounded-sm font-['Montserrat'] font-normal text-xs md:text-[13px]">
                        Text
                      </span>
                    </div>
                  </div>
                  <div className='flex justify-between items-center gap-2'>
                    <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#F5FCFE] rounded hover:bg-[#E7EAED] transition-colors cursor-pointer" onClick={() => window.open(`/lois/${loi.id}`, '_blank')}>
                      <ArrowTopRightOnSquareIcon className="w-[20px] h-[20px] text-[#475569]" />
                    </div>
                    <span className="font-[Montserrat] text-sm md:text-[14px] font-normal text-[#F27F09] cursor-pointer hover:text-[#d66d07] transition-colors flex-1 text-right" onClick={() => router.push(`/lois/${loi.id}`)}> Lire plus</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-1 md:gap-2 mt-6 flex-wrap">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Page précédente"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {getPageNumbers().map((page, index) => (
                  typeof page === 'number' ? (
                    <button
                      key={index}
                      onClick={() => handlePageChange(page)}
                      className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded font-['Montserrat'] font-normal text-sm md:text-[16px] transition-colors ${currentPage === page
                        ? 'bg-[#F27F09] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-gray-400 text-xs md:text-base">
                      {page}
                    </span>
                  )
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Page suivante"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}