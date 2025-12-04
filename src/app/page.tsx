'use client'

import SignalementCard from '@/components/signalements/SignalementCard'
import { useRouter } from 'next/navigation'
import { useAllSignalements, useHabitantSignalements, useCommuneSignalementsCount } from '@/lib/hooks/useSignalements'
import { getPublicUrlFromPath } from '@/lib/services/storage.service'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant, useHabitantSignalementsCount } from '@/lib/hooks/useHabitants'

export default function Home() {
  const router = useRouter()
  const { user } = useSupabaseAuth()
  
  // Récupérer l'habitant connecté
  const { data: habitant, isLoading: loadingHabitant } = useCurrentHabitant(user?.id || null)
  
  // Récupérer les compteurs de signalements
  const { data: userDeclarations = 0, isLoading: loadingUserCount } = useHabitantSignalementsCount(habitant?.id || null)
  const { data: totalDeclarations = 0, isLoading: loadingCommuneCount } = useCommuneSignalementsCount(habitant?.commune_id || null)
  
  // Récupérer les signalements depuis la BDD
  const { data: derniersSignalements = [], isLoading: loadingAll } = useAllSignalements(2)
  const { data: mesSignalements = [], isLoading: loadingMine } = useHabitantSignalements(habitant?.id || null, 2)

  // Système de paliers/niveaux basé sur le nombre de déclarations
  const levels = [
    { name: 'Novice citoyen', min: 0, max: 2, color: '#9CA3AF', icon: 'user' },      // 0-2 déclarations
    { name: 'Citoyen actif', min: 3, max: 9, color: '#3B82F6', icon: 'users' },       // 3-9 déclarations
    { name: 'Citoyen engagé', min: 10, max: 24, color: '#8B5CF6', icon: 'award' },    // 10-24 déclarations
    { name: 'Ambassadeur local', min: 25, max: 49, color: '#F59E0B', icon: 'shield' }, // 25-49 déclarations
    { name: 'Champion citoyen', min: 50, max: Infinity, color: '#10B981', icon: 'trophy' } // 50+ déclarations
  ]

  const getCurrentLevel = (count: number) => {
    return levels.find(level => count >= level.min && count <= level.max) || levels[0]
  }

  const getProgressPercentage = (count: number) => {
    const currentLevel = getCurrentLevel(count)
    if (currentLevel.max === Infinity) return 100
    const range = currentLevel.max - currentLevel.min + 1
    const progress = count - currentLevel.min
    return Math.min((progress / range) * 100, 100)
  }

  const currentLevel = getCurrentLevel(userDeclarations)
  const progressPercentage = getProgressPercentage(userDeclarations)
  
  // Calcul du pourcentage de contribution à la commune (pour info)
  const contributionPercentage = totalDeclarations > 0 
    ? Math.round((userDeclarations / totalDeclarations) * 100) 
    : 0

  // Fonction pour obtenir l'icône SVG selon le niveau
  const getLevelIcon = (iconType: string) => {
    const icons = {
      'user': (
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>
      ),
      'users': (
        <>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"/>
        </>
      ),
      'award': (
        <>
          <circle cx="12" cy="8" r="7"/>
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
        </>
      ),
      'shield': (
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      ),
      'trophy': (
        <>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
        </>
      )
    }
    return icons[iconType as keyof typeof icons] || icons.user
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date inconnue'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  // Fonction pour mapper le statut de la BDD vers le composant
  const getStatut = (statut: string | null): 'En cours' | 'Résolu' | 'Signalé' => {
    if (!statut) return 'Signalé'
    if (statut.toLowerCase().includes('résolu') || statut.toLowerCase().includes('resolu')) return 'Résolu'
    if (statut.toLowerCase().includes('cours')) return 'En cours'
    return 'Signalé'
  }

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-6 md:mb-8">
        Bienvenue {loadingHabitant ? '...' : habitant ? `${habitant.prenom} ${habitant.nom}` : 'Invité'}
      </h1>

      {/* Grid des cards : première ligne avec col-span différents */}
      <div className="space-y-4 md:space-y-6 mb-8 md:mb-12">
        {/* Première ligne : 1 petite card + 1 grande card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Card 1 : Cercle de progression (1/3 de la largeur) */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-md p-4 md:p-6 flex flex-row md:flex-col items-center justify-center gap-4 md:gap-0 md:col-span-1">
            <div className="relative w-20 h-20 md:w-32 md:h-32 md:mb-4 flex-shrink-0">
              {/* Cercle de progression */}
              <svg className="w-full h-full transform -rotate-90">
                {/* Cercle de fond mobile */}
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                  className="md:hidden"
                />
                {/* Cercle de progression mobile */}
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  stroke={currentLevel.color}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="219.91"
                  strokeDashoffset={219.91 - (219.91 * progressPercentage) / 100}
                  strokeLinecap="round"
                  className="md:hidden transition-all duration-500"
                />
                {/* Cercle de fond desktop */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                  className="hidden md:block"
                />
                {/* Cercle de progression desktop */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke={currentLevel.color}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="351.86"
                  strokeDashoffset={351.86 - (351.86 * progressPercentage) / 100}
                  strokeLinecap="round"
                  className="hidden md:block transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-8 md:h-8">
                    {getLevelIcon(currentLevel.icon)}
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-left md:text-center text-xs md:text-sm text-gray-700 flex-1 md:flex-none">
              Vous êtes un acteur engagé pour votre commune
            </p>
          </div>

          {/* Card 2 : Stats sur desktop uniquement */}
          <div className="hidden md:block bg-white rounded-3xl shadow-md p-6 md:col-span-2">
            <div className="flex items-center gap-6">
              {/* Badge niveau */}
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4">Votre niveau</h3>
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-800 rounded-2xl flex items-center justify-center">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      {getLevelIcon(currentLevel.icon)}
                    </svg>
                  </div>
                  <p className="text-center text-xs italic mt-2">{currentLevel.name}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Votre nombre de déclarations</p>
                  <p className="text-4xl font-bold">{loadingUserCount ? '...' : userDeclarations}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nombres de déclarations total<br />dans la commune</p>
                  <p className="text-4xl font-bold">{loadingCommuneCount ? '...' : totalDeclarations}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards séparées pour mobile uniquement */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {/* Votre nombre de déclarations */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            <p className="text-4xl font-bold mb-2">{loadingUserCount ? '...' : userDeclarations}</p>
            <p className="text-xs text-gray-600">Votre nombre de déclarations</p>
          </div>

          {/* Nombre total dans la commune */}
          <div className="bg-white rounded-2xl shadow-md p-4">
            <p className="text-4xl font-bold mb-2">{loadingCommuneCount ? '...' : totalDeclarations}</p>
            <p className="text-xs text-gray-600">Nombres de déclarations total dans la commune</p>
          </div>
        </div>

        {/* Card Votre niveau pour mobile uniquement */}
        <div className="md:hidden bg-white rounded-2xl shadow-md p-4 flex flex-row items-center gap-4">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center flex-shrink-0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              {getLevelIcon(currentLevel.icon)}
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">Votre niveau</h3>
            <p className="text-xs italic">{currentLevel.name}</p>
          </div>
        </div>

        {/* Deuxième ligne : 2 cards égales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Card 3 : Accédez aux lois */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-shadow">
            <p className="text-sm md:text-lg font-medium mb-4">Accédez aux lois mises en vigueur.</p>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-5 md:h-5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </div>

          {/* Card 4 : Consultez la carte */}
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-shadow">
            <p className="text-sm md:text-lg font-medium mb-4">Consultez l'incident sur la carte interactive.</p>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-300 rounded-full flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-5 md:h-5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Section : Les dernières déclarations d'incident */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-semibold">Les dernières déclarations d'incident</h2>
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
        </div>

        {loadingAll ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : derniersSignalements && derniersSignalements.length > 0 ? (
          <>
            {/* Mobile: Carousel avec un seul signalement */}
            <div className="md:hidden">
              <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                <div className="flex gap-3 pb-2">
                  {derniersSignalements.map((signalement) => {
                    const firstPhotoPath = (signalement as any).photos_signalement?.[0]?.url
                    const imageUrl = firstPhotoPath ? getPublicUrlFromPath(firstPhotoPath) : undefined
                    
                    return (
                      <div key={signalement.id} className="snap-start flex-shrink-0 w-full">
                        <SignalementCard
                          titre={signalement.titre || 'Sans titre'}
                          statut={getStatut(signalement.statut)}
                          date={formatDate(signalement.date_signalement)}
                          auteur={`${signalement.prenom || ''} ${signalement.nom || 'Anonyme'}`.trim()}
                          description={signalement.description || 'Aucune description'}
                          coordonnees={signalement.latitude && signalement.longitude ? `${signalement.latitude}, ${signalement.longitude}` : undefined}
                          imageUrl={imageUrl}
                          onClick={() => router.push(`/signalements/${signalement.id}`)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Indicateurs de pagination (points) */}
              <div className="flex justify-center gap-2 mt-4">
                {derniersSignalements.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-gray-900' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: Grid classique */}
            <div className="hidden md:grid grid-cols-2 gap-4 mb-6">
              {derniersSignalements.map((signalement) => {
                // Récupérer la première photo s'il y en a et construire l'URL publique
                const firstPhotoPath = (signalement as any).photos_signalement?.[0]?.url
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
                    onClick={() => router.push(`/signalements/${signalement.id}`)}
                  />
                )
              })}
            </div>

            <div className="text-center hidden md:block">
              <button 
                onClick={() => router.push('/signalements')}
                className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm md:text-base hover:bg-gray-800 transition-colors"
              >
                Voir tout
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-sm md:text-base text-gray-500">Aucun signalement pour le moment</div>
        )}
      </div>

      {/* Section : Vos dernières déclarations d'incident */}
      <div>
        <h2 className="text-lg md:text-2xl font-semibold mb-4 md:mb-6">Vos dernières déclarations d'incident</h2>
        
        {loadingMine ? (
          <div className="text-center py-8 text-sm md:text-base text-gray-500">Chargement...</div>
        ) : mesSignalements && mesSignalements.length > 0 ? (
          <>
            {/* Mobile: Carousel avec un seul signalement */}
            <div className="md:hidden">
              <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                <div className="flex gap-3 pb-2">
                  {mesSignalements.map((signalement) => {
                    const firstPhotoPath = (signalement as any).photos_signalement?.[0]?.url
                    const imageUrl = firstPhotoPath ? getPublicUrlFromPath(firstPhotoPath) : undefined
                    
                    return (
                      <div key={signalement.id} className="snap-start flex-shrink-0 w-full">
                        <SignalementCard
                          titre={signalement.titre || 'Sans titre'}
                          statut={getStatut(signalement.statut)}
                          date={formatDate(signalement.date_signalement)}
                          auteur={`${signalement.prenom || ''} ${signalement.nom || 'Anonyme'}`.trim()}
                          description={signalement.description || 'Aucune description'}
                          coordonnees={signalement.latitude && signalement.longitude ? `${signalement.latitude}, ${signalement.longitude}` : undefined}
                          imageUrl={imageUrl}
                          onClick={() => router.push(`/signalements/${signalement.id}`)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Indicateurs de pagination (points) */}
              <div className="flex justify-center gap-2 mt-4">
                {mesSignalements.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-gray-900' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop: Grid classique */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              {mesSignalements.map((signalement) => {
                // Récupérer la première photo s'il y en a et construire l'URL publique
                const firstPhotoPath = (signalement as any).photos_signalement?.[0]?.url
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
                    onClick={() => router.push(`/signalements/${signalement.id}`)}
                  />
                )
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-sm md:text-base text-gray-500">
            {habitant?.id ? 'Vous n\'avez fait aucune déclaration pour le moment' : 'Connectez-vous pour voir vos déclarations'}
          </div>
        )}
      </div>
    </main>
  )
}