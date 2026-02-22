'use client'

import { useParams, useRouter } from 'next/navigation';
import { useArrete } from '@/lib/hooks/useArretes';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import AlertBanner from '@/components/compte/AlertBanner';
import ArreteContent from '@/components/ui/ArreteContent';

export default function ArretePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: arrete, isLoading, error } = useArrete(id);

  if (isLoading) {
    return (
      <div className="bg-[#f5fcfe] min-h-screen">
        <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />
        <div className="container px-12 py-12 flex justify-center">
          <p className="text-gray-500">Chargement de l&apos;arrêté...</p>
        </div>
      </div>
    );
  }

  if (error || !arrete) {
    return (
      <div className="bg-[#f5fcfe] min-h-screen">
        <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />
        <div className="container px-12 py-12">
          <button
            onClick={() => router.back()}
            className="flex items-center w-[101px] h-[37px] gap-2 px-4 py-2 bg-transparent border border-[#64748B] text-[#053F5C] text-[14px] font-[Poppins] text-md rounded-md hover:bg-[#D9F5FB] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            retour
          </button>
          <p className="text-red-500">Arrêté introuvable.</p>
        </div>
      </div>
    );
  }

  const formattedDate = arrete.date_creation
    ? new Date(arrete.date_creation).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null;

  const formattedModification = arrete.date_modification
    ? new Date(arrete.date_modification).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    : null;

  return (
    <div className="bg-[#f5fcfe] min-h-screen pb-24 md:pb-6">
      <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />

      <div className="container px-2.5 md:px-12">
        {/* Retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center w-[101px] h-[37px] gap-2 px-4 py-2 bg-transparent border border-[#64748B] text-[#053F5C] text-[14px] font-[Poppins] text-md rounded-md hover:bg-[#D9F5FB] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          retour
        </button>
        {/* Contenu */}
        <div className="rounded-3xl pt-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="font-['Poppins'] font-semibold text-xl md:text-[36px]">
                {arrete.titre}
              </h1>
            </div>

            {arrete.fichier_url && (
              <a
                href={arrete.fichier_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#F27F09] text-white rounded-lg font-['Montserrat'] text-[14px] hover:bg-[#d66d07] transition-colors flex-shrink-0"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                Télécharger le PDF
              </a>
            )}
          </div>

          {/* Contenu de l'arrêté */}
          {arrete.contenu && (
            <div className="mt-6 w-full">
              <ArreteContent content={arrete.contenu} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
