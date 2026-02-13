'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
import { useCurrentHabitant, useHabitantSignalementsCount } from '@/lib/hooks/useHabitants';
import { useCommuneSignalementsCount, useAllSignalements, useHabitantSignalements } from '@/lib/hooks/useSignalements';
import { useTypesSignalement } from '@/lib/hooks/useTypesSignalement';
import AlertBanner from '@/components/compte/AlertBanner';
import CardIncident from '@/components/ui/CardIncident';
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown';
import Acteur from '@/components/accueil-v2/Acteur';
import InformationNiveau from '@/components/accueil-v2/InformationNiveau';
import ProgressBar from '@/components/accueil-v2/ProgressBar';
import CardRaccourci from '@/components/accueil-v2/CardRaccourci';
import { getPublicUrlFromPath } from '@/lib/services/storage.service';
import Link from 'next/link';
import { AdjustmentsVerticalIcon } from '@heroicons/react/24/outline';
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage';
import Button from '@/components/ui/Button';
import { UserRole } from '@/types/auth';

function HomeContent() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filters, setFilters] = useState<FilterState | null>(null);

  // Data fetching
  const { data: habitant } = useCurrentHabitant(user?.id || null);
  const { data: userDeclarations = 0 } = useHabitantSignalementsCount(habitant?.id || null);
  const { data: totalDeclarations = 0 } = useCommuneSignalementsCount(habitant?.commune_id || null);
  const { data: derniersSignalementsData } = useAllSignalements(1000);
  const derniersSignalements = derniersSignalementsData || [];
  const { types } = useTypesSignalement();

  const { data: mesSignalementsData } = useHabitantSignalements(habitant?.id || null, 1000);
  const mesSignalements = mesSignalementsData || [];

  // Fonction de filtrage
  const getFilteredSignalements = (signalements: any[]): any[] => {
    if (!filters) return signalements;

    return signalements.filter((signalement) => {
      // Filtrer par dates
      if (filters.startDate || filters.endDate) {
        const sigDate = new Date(signalement.created_at);
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          if (sigDate < startDate) return false;
        }
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (sigDate > endDate) return false;
        }
      }

      // Filtrer par thématiques
      if (filters.themes.length > 0) {
        const typeId = signalement.type_id;
        const typeLibelle = types.find((t) => t.id === typeId)?.libelle;
        if (!typeLibelle || !filters.themes.includes(typeLibelle)) return false;
      }

      return true;
    });
  };

  const filteredDerniersSignalements = getFilteredSignalements(derniersSignalements).slice(0, 2);

  const getLevelInfo = (count: number) => {
    if (count < 3) return {
      label: "Apprenti Signaleur",
      message: "Merci pour votre contribution !",
      threshold: 3
    };
    if (count < 7) return {
      label: "Confirmé",
      message: "Vos signalements améliorent la vie de tous au sein de la commune !",
      threshold: 7
    };
    if (count < 15) return {
      label: "Œil de lynx",
      message: "Aucun incident ne vous échappe !",
      threshold: 15
    };
    if (count < 25) return {
      label: "Sentinelle du quartier",
      message: "Votre engagement inspire la commune et nous vous remercions !",
      threshold: 25
    };
    return {
      label: "Ambassadeur du quartier",
      message: "Vous faites partie du top 1% des contributeurs de votre ville",
      threshold: 60
    };
  };

  const levelInfo = getLevelInfo(userDeclarations);

  const handleCardClick = (signalementId: string) => {
    router.push(`/signalements/${signalementId}`);
  };

  return (
    <div className="bg-[#f5fcfe] min-h-screen w-full relative">
      {/* Alerte Banner */}
      <div className="flex flex-col">
        {/* Alert Banner */}
        <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />
      </div>


      <div className="px-2.5 md:px-12 pb-40 md:pb-12">
        <div className="flex flex-col gap-6 mx-auto">
          {/* Welcome Section */}
          <div>
            <h1 className="font-['Poppins'] font-semibold text-[#242a35] text-xl md:text-[36px] text-center md:text-left mb-6 md:mb-0">
              Bienvenue {habitant?.prenom || 'Nicolas'} {habitant?.nom || 'Moreau'} ! 👋🏻
            </h1>
          </div>

          {/* Stats & Shortcuts Section */}
          <div className="flex flex-col gap-6 md:gap-12">
            {/* Top Row: Acteur & Niveau */}
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Acteur Card */}
              <Acteur
                className="bg-white h-[184px] md:h-[340px] flex flex-row lg:flex-col items-center justify-center rounded-[24px] shadow-sm flex-shrink-0 lg:w-[450px]"
                message={levelInfo.message}
              />

              {/* Niveau Card */}
              <div className="bg-white h-[340px] flex-1 flex flex-col lg:flex-row gap-5 items-center justify-center px-4 py-6 md:p-12 rounded-[24px] shadow-sm">
                <InformationNiveau className="flex-shrink-0 w-[258px]" niveau={levelInfo.label} />

                <div className="flex flex-col gap-5 w-full max-w-[350px]">
                  {/* User Declarations */}
                  <div className="flex flex-col gap-2">
                    <p className="font-['Montserrat'] md:font-['Poppins'] font-semibold md:font-medium text-[#053f5c] text-[14px] md:text-[16px]">
                      Votre nombre de déclarations
                    </p>
                    <p className="font-['Montserrat'] font-semibold text-[#053f5c] text-[20px] md:text-[36px] leading-[32px] md:leading-[48px] mb-2">
                      {userDeclarations}
                    </p>
                    <ProgressBar current={userDeclarations} total={levelInfo.threshold} />
                  </div>

                  {/* Commune Declarations */}
                  <div className="flex flex-col gap-2 mt-4">
                    <p className="font-['Montserrat'] md:font-['Poppins'] font-semibold md:font-medium text-[#053f5c] text-[14px] md:text-[16px]">
                      Déclarations total dans la commune
                    </p>
                    <p className="font-['Montserrat'] font-semibold text-[#053f5c] text-[20px] md:text-[36px] leading-[32px] md:leading-[48px]">
                      {totalDeclarations}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shortcuts Row */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <Link href="/lois" className="flex-1">
                <CardRaccourci label="Accédez aux lois mises en vigueur." />
              </Link>
              <Link href="/carte-incidents" className="flex-1">
                <CardRaccourci label="Consultez l'incident sur la carte interactive." />
              </Link>
            </div>

            {/* Derniers Incidents Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-['Montserrat'] md:font-['Poppins'] font-semibold md:font-medium text-[#242a35] text-[18px] md:text-[30px]">
                  Derniers incidents déclarés
                </h2>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <AdjustmentsVerticalIcon className="w-5 h-5" />
                    <span className="font-['Montserrat'] text-[16px]">Filtres</span>
                  </Button>
                  <FilterDropdown
                    isOpen={showDropdown}
                    onClose={() => setShowDropdown(false)}
                    onApply={(newFilters: FilterState) => {
                      setFilters(newFilters)
                      setShowDropdown(false)
                    }}
                    onClear={() => {
                      setFilters(null)
                      setShowDropdown(false)
                    }}
                    themes={types}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {filteredDerniersSignalements.map((signalement) => (
                  <CardIncident
                    key={signalement.id}
                    title={signalement.titre}
                    label={signalement.statut || 'Signalé'}
                    date={new Date(signalement.created_at).toLocaleDateString()}
                    username={`${signalement.habitants?.prenom} ${signalement.habitants?.nom}`}
                    description={signalement.description}
                    image={signalement.photos_signalement?.[0]?.url ? getPublicUrlFromPath(signalement.photos_signalement[0].url) : undefined}
                    onClick={() => handleCardClick(signalement.id)}
                  />
                ))}
                {filteredDerniersSignalements.length === 0 && (
                  <p className="text-gray-500">Aucun incident ne correspond à vos filtres.</p>
                )}
              </div>

              <div className="flex justify-end">
                <Link href="/signalements">
                  <Button size="xs" variant='primary'>
                    Voir tout
                  </Button>
                </Link>
              </div>
            </div>

            {/* Vos Dernières Déclarations Section */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="font-['Montserrat'] md:font-['Poppins'] font-semibold md:font-medium text-[#242a35] text-[18px] md:text-[30px]">
                  Vos dernières déclarations d’incident
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {mesSignalements.slice(0, 2).map((signalement) => (
                  <CardIncident
                    key={signalement.id}
                    title={signalement.titre}
                    label={signalement.statut || 'Signalé'}
                    date={new Date(signalement.created_at).toLocaleDateString()}
                    username="Vous"
                    description={signalement.description}
                    image={signalement.photos_signalement?.[0]?.url ? getPublicUrlFromPath(signalement.photos_signalement[0].url) : undefined}
                    onClick={() => handleCardClick(signalement.id)}
                  />
                ))}
                {mesSignalements.length === 0 && (
                  <p className="text-gray-500">Vous n&apos;avez pas encore déclaré d&apos;incident.</p>
                )}
              </div>

              <div className="flex justify-end">
                <Link href="/signalements">
                  <Button size="xs" variant='primary'>
                    Voir tout
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <RoleProtectedPage allowedRoles={[UserRole.HABITANT]}>
      <HomeContent />
    </RoleProtectedPage>
  );
}
