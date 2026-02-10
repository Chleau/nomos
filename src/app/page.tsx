'use client'

import React from 'react';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
import { useCurrentHabitant, useHabitantSignalementsCount } from '@/lib/hooks/useHabitants';
import { useCommuneSignalementsCount, useAllSignalements, useHabitantSignalements } from '@/lib/hooks/useSignalements';
import CardIncident from '@/components/ui/CardIncident';
import Acteur from '@/components/accueil-v2/Acteur';
import InformationNiveau from '@/components/accueil-v2/InformationNiveau';
import ProgressBar from '@/components/accueil-v2/ProgressBar';
import CardRaccourci from '@/components/accueil-v2/CardRaccourci';
import { getPublicUrlFromPath } from '@/lib/services/storage.service';
import Link from 'next/link';
import { FunnelIcon } from '@heroicons/react/24/outline'; 
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage';
import Button from '@/components/ui/Button';
import { UserRole } from '@/types/auth';

function HomeContent() {
  const { user } = useSupabaseAuth();
  
  // Data fetching
  const { data: habitant } = useCurrentHabitant(user?.id || null);
  const { data: userDeclarations = 0 } = useHabitantSignalementsCount(habitant?.id || null);
  const { data: totalDeclarations = 0 } = useCommuneSignalementsCount(habitant?.commune_id || null);
  const { data: derniersSignalementsData } = useAllSignalements(2);
  const derniersSignalements = derniersSignalementsData || [];

  const { data: mesSignalementsData } = useHabitantSignalements(habitant?.id || null, 2);
  const mesSignalements = mesSignalementsData || [];

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

  return (
    <div className="bg-[#f5fcfe] min-h-screen w-full relative">
      {/* Alerte Banner */}
      <div className="bg-[#f7ad19] w-full px-4 py-5 flex items-center justify-center mb-8">
        <p className="font-['Montserrat'] font-medium text-[#242a35] text-[20px] text-center">
          ⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage.
        </p>
      </div>

      <div className="max-w-[1328px] mx-auto px-10 pb-12 flex flex-col gap-12">
        {/* Welcome Section */}
        <div>
          <h1 className="font-['Poppins'] font-semibold text-[#242a35] text-[36px]">
            Bienvenue {habitant?.prenom || 'Nicolas'} {habitant?.nom || 'Moreau'} ! 👋🏻
          </h1>
        </div>

        {/* Stats & Shortcuts Section */}
        <div className="flex flex-col gap-12">
          {/* Top Row: Acteur & Niveau */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Acteur Card */}
            <Acteur 
              className="bg-white h-[340px] flex flex-col gap-8 items-center justify-center p-12 rounded-[24px] shadow-sm flex-shrink-0 lg:w-[450px]" 
              message={levelInfo.message}
            />
            
            {/* Niveau Card */}
            <div className="bg-white h-[340px] flex-1 flex flex-col lg:flex-row gap-5 items-center justify-center p-12 rounded-[24px] shadow-sm">
              <InformationNiveau className="flex-shrink-0 w-[258px]" niveau={levelInfo.label} />
              
              <div className="flex flex-col gap-5 w-full max-w-[350px]">
                {/* User Declarations */}
                <div className="flex flex-col gap-2">
                  <p className="font-['Poppins'] font-medium text-[#053f5c] text-[18px]">
                    Votre nombre de déclarations
                  </p>
                  <p className="font-['Montserrat'] font-semibold text-[#053f5c] text-[60px] leading-none mb-2">
                    {userDeclarations}
                  </p>
                  <ProgressBar current={userDeclarations} total={levelInfo.threshold} />
                </div>

                {/* Commune Declarations */}
                <div className="flex flex-col gap-2 mt-4">
                  <p className="font-['Poppins'] font-medium text-[#053f5c] text-[18px]">
                    Déclarations total dans la commune
                  </p>
                  <p className="font-['Montserrat'] font-semibold text-[#053f5c] text-[40px] leading-none">
                    {totalDeclarations}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Shortcuts Row */}
          <div className="flex flex-col md:flex-row gap-12">
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
              <h2 className="font-['Poppins'] font-medium text-[#242a35] text-[30px]">
                Derniers incidents déclarés
              </h2>
              <Button variant="outline" size="xs">
                <FunnelIcon className="w-5 h-5" />
                <span className="font-['Montserrat'] text-[16px]">Filtres</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {derniersSignalements.map((signalement) => (
                <CardIncident
                  key={signalement.id}
                  title={signalement.titre}
                  label={signalement.types_signalement?.libelle || 'Incident'}
                  date={new Date(signalement.created_at).toLocaleDateString()}
                  username={`${signalement.habitants?.prenom} ${signalement.habitants?.nom}`}
                  description={signalement.description}
                  image={signalement.photos_signalement?.[0]?.url ? getPublicUrlFromPath(signalement.photos_signalement[0].url) : undefined}
                />
              ))}
              {derniersSignalements.length === 0 && (
                  <p className="text-gray-500">Aucun incident déclaré récemment.</p>
              )}
            </div>
            
            <div className="flex justify-end">
                <Link href="/signalements">
                  <Button size="xs" variant='ghost'>
                    Voir tout
                  </Button>
                </Link>
            </div>
          </div>

          {/* Vos Dernières Déclarations Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="font-['Poppins'] font-medium text-[#242a35] text-[30px]">
                Vos dernières déclarations d’incident
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {mesSignalements.map((signalement) => (
                <CardIncident
                  key={signalement.id}
                  title={signalement.titre}
                  label={signalement.types_signalement?.libelle || 'Incident'}
                  date={new Date(signalement.created_at).toLocaleDateString()}
                  username="Vous"
                  description={signalement.description}
                  image={signalement.photos_signalement?.[0]?.url ? getPublicUrlFromPath(signalement.photos_signalement[0].url) : undefined}
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
  );
}

export default function Home() {
  return (
    <RoleProtectedPage allowedRoles={[UserRole.HABITANT]}>
      <HomeContent />
    </RoleProtectedPage>
  );
}
