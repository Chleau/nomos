'use client'

import { useParams, useRouter } from 'next/navigation'
import { useSignalement } from '@/lib/hooks/useSignalements'
import { getPublicUrlFromPath } from '@/lib/services/storage.service'
import dynamic from 'next/dynamic'

// Charger la carte dynamiquement côté client uniquement
const IncidentMap = dynamic(() => import('@/components/map/IncidentMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>
  )
})

export default function SignalementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: signalement, isLoading, error } = useSignalement(parseInt(id))

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date inconnue'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !signalement) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-500">Erreur lors du chargement du signalement</p>
            <button
              onClick={() => router.back()}
              className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-lg"
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Récupérer les photos
  const photos = signalement.photos_signalement || []

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header avec retour et notifications */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-900 font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            retour
          </button>
          <button className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
        </div>

        {/* Titre et statut */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Incident #{signalement.id} {signalement.prenom} {signalement.nom}
            </h1>
            <span className="bg-gray-500 text-white px-4 py-1 rounded-full text-sm">
              {signalement.statut || 'En cours'}
            </span>
          </div>
          
          {/* Badge type */}
          {signalement.type_signalement && (
            <span className="inline-block bg-black text-white px-3 py-1 rounded-full text-xs">
              {signalement.type_signalement}
            </span>
          )}
        </div>

        {/* Grid : Rappel de l'incident + Lieu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Card Rappel de l'incident */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Rappel de l&apos;incident</h2>
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h3 className="text-lg italic font-medium mb-4">{signalement.titre || 'Sans titre'}</h3>
              
              <div className="flex items-center gap-2 mb-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                  <span className="font-medium">{signalement.statut || 'Signalé'}</span>
                </div>
                <span className="text-gray-600">Déclaré le {formatDate(signalement.date_signalement)}</span>
                <span className="font-medium">{signalement.prenom} {signalement.nom?.charAt(0) || 'M'}</span>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 mb-2">Contact</h4>
                <p className="text-sm text-gray-700">{signalement.telephone || 'Non renseigné'}</p>
                <p className="text-sm text-gray-700">{signalement.email || 'anonyme@gmail.com'}</p>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {signalement.description || 'Aucune description'}
              </p>

            </div>
          </div>
          
          {/* Card Lieu de l'incident */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Lieu de l&apos;incident</h2>
            <div className="bg-white rounded-2xl shadow-md p-5 h-[400px] relative">
              {/* Carte interactive */}
              {signalement.latitude && signalement.longitude ? (
                <div className="w-full h-full">
                  <IncidentMap
                    markers={[{
                      id: signalement.id.toString(),
                      titre: signalement.titre,
                      description: signalement.description,
                      latitude: signalement.latitude,
                      longitude: signalement.longitude,
                      imageUrl: photos.length > 0 ? getPublicUrlFromPath(photos[0].url) : null,
                      statut: signalement.statut
                    }]}
                    center={[signalement.latitude, signalement.longitude]}
                    zoom={15}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 text-gray-400">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <p className="text-sm text-gray-500">Pas de coordonnées disponibles</p>
                  </div>
                </div>
              )}
              
              {/* Coordonnées en bas */}
              {signalement.latitude && signalement.longitude && (
                <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span className="text-sm">{signalement.adresse || `${signalement.latitude.toFixed(6)}, ${signalement.longitude.toFixed(6)}`}</span>
                  </div>
                  <button 
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => {
                      navigator.clipboard.writeText(`${signalement.latitude}, ${signalement.longitude}`)
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Photos de l'incident */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Photos de l&apos;incident</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.length > 0 ? (
              photos.map((photo: { id: number; url: string }, index: number) => {
                const photoUrl = getPublicUrlFromPath(photo.url)
                return (
                  <div key={photo.id || index} className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                    <img src={photoUrl} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  </div>
                )
              })
            ) : (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-square bg-gray-200 rounded-xl"></div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
