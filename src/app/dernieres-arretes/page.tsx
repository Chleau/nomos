'use client'

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AlertBanner from '@/components/compte/AlertBanner';
import { ArrowTopRightOnSquareIcon, AdjustmentsVerticalIcon } from '@heroicons/react/24/outline';
import { useSearchArretes } from '@/lib/hooks/useArretes';
import Button from '@/components/ui/Button';
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown';

export default function DerniereArreteesPage() {
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
  const { data: allArretes, isLoading, error } = useSearchArretes(searchQuery);

  // Récupérer les thématiques uniques
  const thematiques = useMemo(() => {
    if (!allArretes) return [];
    const uniqueThemes = [...new Set(allArretes.map((arrete: any) => arrete.thematique).filter(Boolean))];
    return uniqueThemes.sort();
  }, [allArretes]);

  // Filtrer les arrêtés par thématique et les filtres appliqués
  const arretes = useMemo(() => {
    if (!allArretes) return [];

    let filtered = allArretes;

    // Filtrer par thématique sélectionnée (boutons à gauche)
    if (selectedThematique) {
      filtered = filtered.filter((arrete: any) => arrete.thematique === selectedThematique);
    }

    // Filtrer par thématique depuis le dropdown
    if (filters.themes && filters.themes.length > 0) {
      filtered = filtered.filter((arrete: any) => filters.themes.includes(arrete.thematique));
    }

    // Filtrer par période
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((arrete: any) => {
        const arretDate = new Date(arrete.date_creation);

        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          if (arretDate < startDate) return false;
        }

        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (arretDate > endDate) return false;
        }

        return true;
      });
    }

    return filtered;
  }, [allArretes, selectedThematique, filters]);

  const ITEMS_PER_PAGE = 12;

  // Réinitialiser la page quand la recherche ou le filtre change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedThematique, filters]);

  // Calcul de la pagination
  const totalPages = arretes ? Math.ceil(arretes.length / ITEMS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArretes = arretes ? arretes.slice(startIndex, endIndex) : [];

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
    <div className="bg-[#f5fcfe] min-h-screen relative">
      {/* Main Content - offset for sidebar */}
      <div className="flex flex-col">
        {/* Alert Banner */}
        <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />
      </div>

      <div className="container px-12 mb-8">
        <h1 className="font-['Poppins'] font-semibold text-[36px] mb-6">
          Derniers arrêtés
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
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {thematiques.map((thematique) => (
            <button
              key={thematique}
              onClick={() => setSelectedThematique(selectedThematique === thematique ? null : thematique)}
              className={`px-2 h-[32px] flex items-center rounded-lg font-['Montserrat'] text-[16px] font-no transition-colors ${selectedThematique === thematique
                ? 'bg-[#F27F09] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              {thematique}
            </button>
          ))}
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
            <p className="text-gray-500">Chargement des arrêtés...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Erreur lors du chargement des arrêtés</p>
          </div>
        )}

        {!isLoading && !error && arretes && arretes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun arrêté trouvé</p>
          </div>
        )}

        {!isLoading && !error && arretes && arretes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
              {currentArretes.map((arrete: any) => (
                <div key={arrete.id} className="bg-white rounded-3xl border border-[#E7EAED] p-6 h-[172px] w-full flex flex-col justify-between">
                  <div className="flex flex-col gap-[20px]">
                    <h2 className="font-['Montserrat'] text-normal text-[14px]">{arrete.titre}</h2>
                    <div className="flex items-center gap-[8px]">
                      <span className="w-[37px] h-[24px] border border-[#475569] bg-[#E7EAED] text-[#64748B] px-[4px] py-[2px] rounded-sm font-['Montserrat'] font-normal text-[13px]">
                        Text
                      </span>
                    </div>
                  </div>
                  <div className='flex justify-between'>
                    <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#F5FCFE] rounded hover:bg-[#E7EAED] transition-colors cursor-pointer" onClick={() => window.open(`/dernieres-arretes/${arrete.id}`, '_blank')}>
                      <ArrowTopRightOnSquareIcon className="w-[20px] h-[20px] text-[#475569]" />
                    </div>
                    <span className="font-[Montserrat] text-[14px] font-normal text-[#F27F09] cursor-pointer hover:text-[#d66d07] transition-colors" onClick={() => router.push(`/dernieres-arretes/${arrete.id}`)}> Lire plus</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className={`w-8 h-8 flex items-center justify-center rounded font-['Montserrat'] font-normal text-[16px] transition-colors ${currentPage === page
                        ? 'bg-[#F27F09] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {page}
                    </button>
                  ) : (
                    <span key={index} className="w-8 h-8 flex items-center justify-center text-gray-400">
                      {page}
                    </span>
                  )
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Page suivante"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>)}
      </div>
    </div>
  );
}