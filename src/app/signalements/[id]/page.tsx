'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useSignalement, useSignalements } from '@/lib/hooks/useSignalements'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { getPublicUrlFromPath } from '@/lib/services/storage.service'
import dynamic from 'next/dynamic'
import { BellIcon, BellSlashIcon, PencilIcon } from '@heroicons/react/24/outline'
import EditSignalementModal from '@/components/signalements/EditSignalementModal'

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
  const { user } = useSupabaseAuth()
  const { data: currentHabitant } = useCurrentHabitant(user?.id ?? null)

  const [fullAddress, setFullAddress] = useState<string>('')
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [notificationsMuted, setNotificationsMuted] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Vérifier si l'utilisateur actuel est le créateur du signalement
  const isCreator = signalement && currentHabitant && signalement.habitant_id === currentHabitant.id

  const statutsConfig = {
    'Résolu': {
      bgColor: '#DBEAFE',
      textColor: '#059669',
      dotColor: '#10B981',
      borderColor: '#BAE6FD'
    },
    'En cours': {
      bgColor: '#FED7AA',
      textColor: '#D97706',
      dotColor: '#F59E0B',
      borderColor: '#FDBA74'
    },
    'Urgent': {
      bgColor: '#FECACA',
      textColor: '#DC2626',
      dotColor: '#EF4444',
      borderColor: '#FCA5A5'
    },
    'En attente': {
      bgColor: '#E2E8F0',
      textColor: '#475569',
      dotColor: '#64748B',
      borderColor: '#64748B'
    }
  }

  const statuts = ['Résolu', 'En cours', 'Urgent', 'En attente']

  // Mapper le statut actuel au statut du dropdown, ou utiliser "En attente" par défaut
  const getDisplayStatus = (status: string | null) => {
    if (!status || status === 'Signalé') return 'En attente'
    return status
  }

  // Fonction pour faire du reverse geocoding (coordonnées → adresse)
  const reverseGeocode = async (latitude: number, longitude: number) => {
    setLoadingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Nomos-App'
          }
        }
      );
      const data = await response.json();

      if (data && data.address) {
        // Extraire tous les détails disponibles
        const houseNumber = data.address.house_number || ''
        const road = data.address.road || data.address.street || data.address.street_name || ''
        const city = data.address.city || data.address.town || data.address.village || data.address.municipality || ''
        const postalCode = data.address.postcode || ''

        // Construire l'adresse complète
        const address = `${houseNumber} ${road}`.trim()
        const fullAddr = `${address} ${postalCode} ${city}`.trim()
        setFullAddress(fullAddr)
      }
    } catch (error) {
      console.error('Erreur de reverse géocodage:', error);
    } finally {
      setLoadingAddress(false)
    }
  };

  // Reverse geocode quand les coordonnées changent
  useEffect(() => {
    if (signalement?.latitude && signalement?.longitude) {
      reverseGeocode(signalement.latitude, signalement.longitude)
    }
  }, [signalement?.latitude, signalement?.longitude])

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
    <div className="bg-[#f5fcfe] min-h-screen px-12 py-6">
      <div className="mx-auto">
        {/* Header avec retour et notifications */}
        <div className="flex items-center justify-between mb-[44px]">
          <button
            onClick={() => router.back()}
            className="flex items-center w-[101px] h-[37px] gap-2 px-4 py-2 bg-transparent border border-[#64748B] text-[#053F5C] text-[14px] font-[Poppins] text-md rounded-md hover:bg-[#D9F5FB] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            retour
          </button>
          <button
            onClick={() => setNotificationsMuted(!notificationsMuted)}
            className="p-2 text-[#053F5C]"
            title={notificationsMuted ? 'Activer les notifications' : 'Désactiver les notifications'}
          >
            {notificationsMuted ? (
              <BellSlashIcon width="24" height="24" />
            ) : (
              <BellIcon width="24" height="24" />
            )}
          </button>
        </div>

        {/* Titre et statut */}
        <div className="mb-[44px]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-['Poppins'] font-semibold text-[36px]">
              Incident #{signalement.id} {signalement.prenom} {signalement.nom}
            </h1>
            {/* Dropdown Statut */}
            <div className="relative">
              {(() => {
                const displayStatus = getDisplayStatus(signalement.statut)
                const statusStyle = statutsConfig[displayStatus as keyof typeof statutsConfig] || statutsConfig['En attente']
                return (
                  <button
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className="h-[24px] min-w-[135px] px-3 py-0.5 rounded-sm font-['Montserrat'] font-normal text-[14px] whitespace-nowrap flex items-center justify-between gap-2 border"
                    style={{
                      backgroundColor: statusStyle.bgColor,
                      color: statusStyle.textColor,
                      borderColor: statusStyle.borderColor
                    }}
                  >
                    {displayStatus}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </button>
                )
              })()}

              {/* Dropdown Menu */}
              {isStatusDropdownOpen && (
                <div className="absolute right-0 mt-2 min-w-[135px] bg-white flex flex-col items-start p-0 z-50 rounded-[8px] shadow-lg border border-gray-200">
                  <div className="w-full mt-1 px-2 py-1 font-['Montserrat'] font-semibold text-[16px] text-[#475569]">
                    Statut
                  </div>
                  {statuts.map((statut) => {
                    const statusStyle = statutsConfig[statut as keyof typeof statutsConfig] || statutsConfig['En attente']

                    return (
                      <div
                        key={statut}
                        className="w-full text-left px-4 py-2 font-['Montserrat'] text-[14px] flex items-center gap-2"
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: statusStyle.dotColor }}
                        ></div>
                        {statut}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          {/* Badge type */}
          {signalement.types_signalement && (
            <span className=" h-[24px] inline-block px-1 py-0.5 rounded-sm bg-[#F5F3FF] text-[#8B5CF6] border border-[#DDD6FE] font-['Montserrat'] font-normal text-[14px]">
              {signalement.types_signalement.libelle}
            </span>
          )}
        </div>

        {/* Grid : Rappel de l'incident + Lieu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-[44px]">
          {/* Card Rappel de l'incident */}
          <div>
            <h2 className="font-['Poppins'] font-medium text-[30px] mb-[14px]">Rappel de l'incident</h2>
            <div className="bg-white rounded-2xl shadow-md p-5 w-full h-[295px] relative">
              <h3 className="font-['Poppins'] font-medium text-[20px] text-[#475569] mb-4">{signalement.titre || 'Sans titre'}</h3>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                  <span className="font-medium">{signalement.statut || 'Signalé'}</span>
                </div>
                <span className="text-sm text-[#053F5C]">Déclaré le {formatDate(signalement.date_signalement)}</span>
                <span className="text-sm font-medium">{signalement.prenom} {signalement.nom?.charAt(0) || 'M'}</span>
              </div>

              <div className="mb-4">
                <h4 className="font-['Poppins'] font-medium text-[18px] text-[#64748B] mb-4">Contact</h4>
                <div className='flex items-center gap-4 mb-4 text-sm'>
                  <p className="font-['Poppins'] font-regular text-[14px] text-gray-600">{signalement.telephone || 'Non renseigné'}</p>
                  <p className="font-['Poppins'] font-regular text-[14px] text-gray-600">{signalement.email || 'anonyme@gmail.com'}</p>
                </div>
              </div>

              <p className="font-['Montserrat] font-normal text-[14px] text-[#242A35] pr-10">
                {signalement.description || 'Aucune description'}
              </p>

              {isCreator && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute p-2 text-[#053F5C] hover:bg-[#D9F5FB] rounded-lg transition-colors"
                  style={{ bottom: '25px', right: '25px' }}
                  title="Modifier le signalement"
                >
                  <PencilIcon width="24" height="24" />
                </button>
              )}
            </div>
          </div>

          {/* Card Lieu de l'incident */}
          <div>
            <h2 className="font-['Poppins'] font-medium text-[30px] mb-[14px]">Lieu de l'incident</h2>
            <div className="rounded-2xl shadow-md w-full h-[295px] relative overflow-hidden">
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

              {/* Adresse en bas */}
              {signalement.latitude && signalement.longitude && (
                <div className="absolute bottom-0 left-0 right-0 h-[58px] bg-white/95 backdrop-blur-sm p-3 shadow-md flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span className="font-['Montserrat'] font-normal text-[14px] text-[#053F5C]">
                      {loadingAddress ? 'Chargement...' : (fullAddress || 'Adresse non disponible')}
                    </span>
                  </div>
                  <button
                    className="p-1 hover:bg-gray-100 rounded"
                    onClick={() => {
                      navigator.clipboard.writeText(fullAddress || `${signalement.latitude}, ${signalement.longitude}`)
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          <h2 className="font-['Poppins'] font-medium text-[30px] mb-[14px]">Photos de l'incident</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.length > 0 ? (
              photos.map((photo: { id: number; url: string }, index: number) => {
                const photoUrl = getPublicUrlFromPath(photo.url)
                return (
                  <div key={photo.id || index} className="aspect-square bg-gray-200 rounded-xl overflow-hidden relative">
                    <Image src={photoUrl} alt={`Photo ${index + 1}`} className="object-cover" fill sizes="(max-width: 768px) 50vw, 25vw" />
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

        {/* Modal de modification */}
        {isEditModalOpen && <EditSignalementModal signalement={signalement} onClose={() => setIsEditModalOpen(false)} />}
      </div>
    </div>
  )
}
