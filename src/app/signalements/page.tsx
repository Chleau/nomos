'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SignalementCard from '@/components/signalements/SignalementCard'
import { useAllSignalements } from '@/lib/hooks/useSignalements'
import { getPublicUrlFromPath } from '@/lib/services/storage.service'

export default function SignalementsPage() {
  const router = useRouter()
  const [limit] = useState<number | undefined>(undefined) // Pas de limite, afficher tous
  const [sortOrder, setSortOrder] = useState<'recent' | 'ancien'>('recent')

  const { data: signalements = [], isLoading } = useAllSignalements(limit)

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date inconnue'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  // Fonction pour mapper le statut
  const getStatut = (statut: string | null): 'En cours' | 'Résolu' | 'Signalé' => {
    if (!statut) return 'Signalé'
    if (statut.toLowerCase().includes('résolu') || statut.toLowerCase().includes('resolu')) return 'Résolu'
    if (statut.toLowerCase().includes('cours')) return 'En cours'
    return 'Signalé'
  }

  // Trier les signalements
  const sortedSignalements = [...(signalements || [])].sort((a, b) => {
    const dateA = new Date(a.date_signalement || a.created_at || 0).getTime()
    const dateB = new Date(b.date_signalement || b.created_at || 0).getTime()
    return sortOrder === 'recent' ? dateB - dateA : dateA - dateB
  })

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header avec bouton retour */}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl mb-6 font-bold">Toutes les déclarations d&apos;incident</h1>


        {/* Filtres */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {signalements?.length || 0} {(signalements?.length || 0) > 1 ? 'signalements trouvés' : 'signalement trouvé'}
          </p>
          <div className="flex items-center gap-2">
            <button className="bg-gray-900 text-white px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              <span className="hidden md:inline">Filtres</span>
            </button>
            <button className="px-3 py-2 md:px-4 md:py-2 bg-gray-900 text-white rounded-lg text-xs md:text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
              onClick={() => setSortOrder(sortOrder === 'recent' ? 'ancien' : 'recent')}
            >
              Trier par : {sortOrder === 'recent' ? 'le plus récent' : 'le plus ancien'}
            </button>
          </div>
        </div>



        {/* Liste des signalements */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : !signalements || signalements.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun signalement pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
            {sortedSignalements.map((signalement) => {
              const firstPhotoPath = signalement.photos_signalement?.[0]?.url
              const imageUrl = firstPhotoPath ? getPublicUrlFromPath(firstPhotoPath) : undefined

              return (
                <SignalementCard
                  key={signalement.id}
                  titre={signalement.titre || 'Sans titre'}
                  statut={getStatut(signalement.statut)}
                  date={formatDate(signalement.date_signalement)}
                  auteur={`${signalement.prenom || ''} ${signalement.nom || 'Anonyme'}`.trim()}
                  description={signalement.description || 'Aucune description'}
                  coordonnees={signalement.latitude && signalement.longitude ? `${signalement.latitude}, ${signalement.longitude}` : undefined}
                  imageUrl={imageUrl}
                  backgroundColor={!signalement.valide ? 'bg-[#F1F5F9]' : 'bg-white'}
                  onClick={() => router.push(`/signalements/${signalement.id}`)}
                />
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
