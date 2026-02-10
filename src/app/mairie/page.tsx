'use client'

import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown'
import CardIncident from '@/components/ui/CardIncident'
import Avatar from '@/components/ui/Avatar'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { useRouter } from 'next/navigation'
import { useAllSignalements } from '@/lib/hooks/useSignalements'
import { useTypesSignalement } from '@/lib/hooks/useTypesSignalement'
import { getPublicUrlFromPath } from '@/lib/services/storage.service'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { UserRole } from '@/types/auth'
import { useState } from 'react'
import { StarIcon } from '@heroicons/react/24/outline'

function MairieContent() {
  const router = useRouter()
  const { user } = useSupabaseAuth()
  const { data: habitant } = useCurrentHabitant(user?.id || null)
  const { types } = useTypesSignalement()

  const { data: derniersSignalements = [], isLoading: loadingAll } = useAllSignalements(1000)

  // États de tri
  const [sortIncidents, setSortIncidents] = useState<'recent' | 'ancien'>('recent')
  const [sortRedactions, setSortRedactions] = useState<'recent' | 'ancien'>('recent')
  const [sortLois, setSortLois] = useState<'recent' | 'ancien'>('recent')

  // États de filtre
  const [filterIncidents, setFilterIncidents] = useState<FilterState | null>(null)
  const [filterRedactionsState, setFilterRedactionsState] = useState<FilterState | null>(null)
  const [filterLoisState, setFilterLoisState] = useState<FilterState | null>(null)
  
  // Modales de filtre
  const [showFilterIncidents, setShowFilterIncidents] = useState(false)
  const [showFilterRedactions, setShowFilterRedactions] = useState(false)
  const [showFilterLois, setShowFilterLois] = useState(false)
  
  // États pour les checkboxes de la table
  const [selectedRedactions, setSelectedRedactions] = useState<Set<number>>(new Set())

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date inconnue'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  const getStatut = (statut: string | null): 'En cours' | 'Résolu' | 'Signalé' => {
    if (!statut) return 'Signalé'
    if (statut.toLowerCase().includes('résolu') || statut.toLowerCase().includes('resolu')) return 'Résolu'
    if (statut.toLowerCase().includes('cours')) return 'En cours'
    return 'Signalé'
  }

  const toggleRedactionSelection = (id: number) => {
    const newSelected = new Set(selectedRedactions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRedactions(newSelected)
  }

  const toggleSelectAllRedactions = () => {
    if (selectedRedactions.size === filteredRedactions.length) {
      setSelectedRedactions(new Set())
    } else {
      setSelectedRedactions(new Set(filteredRedactions.map(r => r.id)))
    }
  }

  // Mock de rédactions (à remplacer par l'API si besoin)
  const redactions = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    title: "Arrêté portant réglementation de la circulation lors de travaux sur la route du changement de la route",
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Dates décalées
    dateStr: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    category: 'sécurité publique'
  }))

  // Mock lois
  const lois = Array.from({ length: 2 }).map((_, i) => ({
    id: i + 1,
    title: "LOI organique n° 2022-400 du 21 mars 2022 visant à renforcer le rôle du Défenseur des droits en matière de signalement d'alerte",
    date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000), // Dates décalées par semaine
    category: 'Droit'
  }))

  // Fonctions de tri
  const sortSignalements = (signalements: any[] | null) => {
    if (!signalements) return []
    const sorted = [...signalements]
    if (sortIncidents === 'recent') {
      sorted.sort((a, b) => new Date(b.date_signalement).getTime() - new Date(a.date_signalement).getTime())
    } else {
      sorted.sort((a, b) => new Date(a.date_signalement).getTime() - new Date(b.date_signalement).getTime())
    }
    return sorted
  }

  const sortRedactionsArray = (items: any[]) => {
    const sorted = [...items]
    if (sortRedactions === 'recent') {
      sorted.sort((a, b) => b.date.getTime() - a.date.getTime())
    } else {
      sorted.sort((a, b) => a.date.getTime() - b.date.getTime())
    }
    return sorted
  }

  const sortLoisArray = (items: any[]) => {
    const sorted = [...items]
    if (sortLois === 'recent') {
      sorted.sort((a, b) => b.date.getTime() - a.date.getTime())
    } else {
      sorted.sort((a, b) => a.date.getTime() - b.date.getTime())
    }
    return sorted
  }

  const sortedSignalements = sortSignalements(derniersSignalements)
  const sortedRedactions = sortRedactionsArray(redactions)
  const sortedLois = sortLoisArray(lois)

  // Fonctions de filtrage
  const filterSignalements = (signalements: any[]) => {
    if (!filterIncidents) return signalements
    
    let filtered = signalements
    
    // Filtre par dates
    if (filterIncidents.startDate || filterIncidents.endDate) {
      filtered = filtered.filter(s => {
        const signalDate = new Date(s.date_signalement)
        if (filterIncidents.startDate) {
          const startDate = new Date(filterIncidents.startDate)
          if (signalDate < startDate) return false
        }
        if (filterIncidents.endDate) {
          const endDate = new Date(filterIncidents.endDate)
          endDate.setHours(23, 59, 59, 999)
          if (signalDate > endDate) return false
        }
        return true
      })
    }
    
    // Filtre par thématiques (types de signalement)
    if (filterIncidents.themes && filterIncidents.themes.length > 0) {
      filtered = filtered.filter(s => {
        const typeId = s.type_id
        const typeLibelle = types.find((t) => t.id === typeId)?.libelle
        return typeLibelle && filterIncidents.themes.includes(typeLibelle)
      })
    }
    
    return filtered
  }

  const filterRedactionsArray = (items: any[]) => {
    if (!filterRedactionsState) return items
    
    let filtered = items
    
    // Filtre par dates
    if (filterRedactionsState.startDate || filterRedactionsState.endDate) {
      filtered = filtered.filter(r => {
        const rDate = r.date
        if (filterRedactionsState.startDate) {
          const startDate = new Date(filterRedactionsState.startDate)
          if (rDate < startDate) return false
        }
        if (filterRedactionsState.endDate) {
          const endDate = new Date(filterRedactionsState.endDate)
          endDate.setHours(23, 59, 59, 999)
          if (rDate > endDate) return false
        }
        return true
      })
    }
    
    // Filtre par thèmes (catégories)
    if (filterRedactionsState.themes && filterRedactionsState.themes.length > 0) {
      filtered = filtered.filter(r => 
        filterRedactionsState.themes.includes(r.category)
      )
    }
    
    return filtered
  }

  const filterLoisArray = (items: any[]) => {
    if (!filterLoisState) return items
    
    let filtered = items
    
    // Filtre par dates
    if (filterLoisState.startDate || filterLoisState.endDate) {
      filtered = filtered.filter(l => {
        const lDate = l.date
        if (filterLoisState.startDate) {
          const startDate = new Date(filterLoisState.startDate)
          if (lDate < startDate) return false
        }
        if (filterLoisState.endDate) {
          const endDate = new Date(filterLoisState.endDate)
          endDate.setHours(23, 59, 59, 999)
          if (lDate > endDate) return false
        }
        return true
      })
    }
    
    // Filtre par thèmes (catégories)
    if (filterLoisState.themes && filterLoisState.themes.length > 0) {
      filtered = filtered.filter(l => 
        filterLoisState.themes.includes(l.category)
      )
    }
    
    return filtered
  }

  const filteredSignalements = filterSignalements(sortedSignalements)
  const filteredRedactions = filterRedactionsArray(sortedRedactions)
  const filteredLois = filterLoisArray(sortedLois)


  return (
    <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
      <main className="min-h-screen p-[50px]">
      {/* Barre de recherche et filtres */}
      <div className="mb-[58px] space-y-[16px]">
        {/* Search bar */}
        <div className="input input--full">
          <span className="input__icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <input
            type="search"
            placeholder="Rechercher ..."
            aria-label="Rechercher"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex gap-[15px]">
          <Button size="xs" variant="outline"> <StarIcon width="16" height="16" /> Anciens arrêtés</Button>
          <Button size="xs" variant="outline"> <StarIcon width="16" height="16" />Anciennes délibérations</Button>
        </div>
      </div>

      {/* Derniers incidents déclarés */}
      <div className="mb-[58px] space-y-[25px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[30px] font-['Poppins'] font-medium text-[#4a4a4a]">Derniers incidents déclarés</h2>
          <div className="relative">
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => setShowFilterIncidents(!showFilterIncidents)}
            >
              Filtres
            </Button>
            <FilterDropdown
              isOpen={showFilterIncidents}
              onClose={() => setShowFilterIncidents(false)}
              onApply={(filters) => {
                setFilterIncidents(filters)
                setShowFilterIncidents(false)
              }}
              onClear={() => {
                setFilterIncidents(null)
                setShowFilterIncidents(false)
              }}
              themes={types}
            />
          </div>
        </div>

        {loadingAll ? (
          <div className="text-gray-500">Chargement...</div>
        ) : derniersSignalements && derniersSignalements.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[58px]">
              {filteredSignalements.slice(0, 2).map((signalement) => {
                const firstPhotoPath = (signalement as any).photos_signalement?.[0]?.url
                const imageUrl = firstPhotoPath ? getPublicUrlFromPath(firstPhotoPath) : undefined
                const userName = signalement.prenom ? `${signalement.prenom} ${signalement.nom}` : 'Anonyme'

                return (
                  <CardIncident
                    key={signalement.id}
                    image={imageUrl}
                    title={signalement.titre || 'Sans titre'}
                    label={getStatut(signalement.statut)}
                    date={formatDate(signalement.date_signalement)}
                    username={userName}
                    description={signalement.description || 'Aucune description'}
                    onClick={() => router.push(`/signalements/${signalement.id}`)}
                  />
                )
              })}
            </div>

            <div className="mt-[30px] text-right">
              <Button onClick={() => router.push('/signalements')} variant="primary" size="sm">
                Voir tout
              </Button>
            </div>
          </>
        ) : (
          <div className="text-gray-500">Aucun incident récemment déclaré</div>
        )}
      </div>

      {/* Mes dernières rédactions */}
      <div className="mb-[58px] space-y-[23px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-['Montserrat'] font-medium text-[#242a35]">Mes dernières rédactions</h2>
          <div className="flex gap-[20px]">
            <div className="relative">
              <Button 
                size="sm" 
                variant="primary"
                onClick={() => setShowFilterRedactions(!showFilterRedactions)}
              >
                Filtres
              </Button>
              <FilterDropdown
                isOpen={showFilterRedactions}
                onClose={() => setShowFilterRedactions(false)}
                onApply={(filters) => {
                  setFilterRedactionsState(filters)
                  setShowFilterRedactions(false)
                }}
                onClear={() => {
                  setFilterRedactionsState(null)
                  setShowFilterRedactions(false)
                }}
                themes={types}
              />
            </div>
            
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => setSortRedactions(sortRedactions === 'recent' ? 'ancien' : 'recent')}
            >
              {sortRedactions === 'recent' ? 'trier par : le plus récent' : 'trier par : le plus ancien'}
            </Button>
            <Button size="sm" variant="primary">Nouveau</Button>
          </div>
        </div>

        {/* Redactions table */}
        <div className="bg-white rounded-lg overflow-hidden border border-[#e7eaed]">
          {/* Table header */}
          <div className="grid grid-cols-[48px_76px_1fr_123px_212px_222px_199px_167px_auto] bg-white border-b border-[#e7eaed] px-0 py-0">
            <div className="flex items-center justify-center h-[40px] border-r border-[#e7eaed]">
              <Checkbox
                size="lg"
                checked={selectedRedactions.size === filteredRedactions.length && filteredRedactions.length > 0}
                onChange={toggleSelectAllRedactions}
              />
            </div>
            <div className="flex items-center justify-center h-[40px] px-[16px] border-r border-[#e7eaed]">
              <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569]">Favoris</span>
            </div>
            <div className="flex items-center h-[40px] px-[16px] border-r border-[#e7eaed]">
              <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569]">Contenu</span>
            </div>
            <div className="flex items-center h-[40px] px-[16px] border-r border-[#e7eaed]">
              <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569]">Date</span>
            </div>
            <div className="flex items-center h-[40px] px-[16px] border-r border-[#e7eaed]">
              <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569]">Lieu</span>
            </div>
            <div className="flex items-center h-[40px] px-[16px] border-r border-[#e7eaed]">
              <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569]">Habitant</span>
            </div>
            <div className="flex items-center h-[40px] px-[16px] border-r border-[#e7eaed]">
              <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569]">Catégorie</span>
            </div>
            <div className="flex items-center h-[40px] px-[16px] border-r border-[#e7eaed]">
              <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569]">Statut</span>
            </div>
            <div className="flex items-center h-[40px] px-[16px]">
              <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569]">Action</span>
            </div>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-[#e7eaed]">
            {filteredRedactions.map((r, idx) => (
              <div key={r.id} className="grid grid-cols-[48px_76px_1fr_123px_212px_222px_199px_167px_auto] hover:bg-gray-50">
                <div className="flex items-center justify-center h-[56px] border-r border-[#e7eaed]">
                  <input
                    type="checkbox"
                    checked={selectedRedactions.has(r.id)}
                    onChange={() => toggleRedactionSelection(r.id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-center h-[56px] px-[16px] border-r border-[#e7eaed]">
                  <span className="text-[18px] cursor-pointer hover:text-orange-500">★</span>
                </div>
                <div className="flex items-center h-[56px] px-[16px] border-r border-[#e7eaed]">
                  <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569] truncate">
                    {r.title}
                  </span>
                </div>
                <div className="flex items-center h-[56px] px-[16px] border-r border-[#e7eaed]">
                  <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569]">
                    {r.dateStr}
                  </span>
                </div>
                <div className="flex items-center h-[56px] px-[16px] border-r border-[#e7eaed]">
                  <span className="text-[14px] font-['Montserrat'] font-normal text-[#475569] flex items-center gap-[8px]">
                    📍 Route de vanne
                  </span>
                </div>
                <div className="flex items-center h-[56px] px-[16px] border-r border-[#e7eaed]">
                  <div className="flex items-center gap-[8px]">
                    <Avatar initials={['NM', 'ED', 'AB', 'IM', 'HM', 'SP', 'YB', 'LR', 'MK', 'CF'][idx] || 'NM'} size="md" />
                    <div className="flex flex-col">
                      <span className="text-[14px] font-['Montserrat'] font-medium text-[#242a35]">
                        {['Nicolas Moreau', 'Emma Dupont', 'Adam Bernard', 'Inès Moreau', 'Hugo Mandereau', 'Sarah Petit', 'Yassine Benali', 'Léa Robert', 'Mehdi Khellaf', 'Chloé Fournier'][idx] || 'Utilisateur'}
                      </span>
                      <span className="text-[12px] font-['Montserrat'] font-normal text-[#64748b]">
                        ID: {['8471', '5609', '2348', '9014', '6752', '4186', '7390', '1547', '8821', '2891'][idx] || '0000'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center h-[56px] px-[16px] border-r border-[#e7eaed]">
                  <span className="inline-block bg-[#fef0e3] border border-[#facb9a] rounded-lg px-[8px] py-[4px] text-[14px] font-['Montserrat'] font-normal text-[#f27f09] whitespace-nowrap">
                    {r.category}
                  </span>
                </div>
                <div className="flex items-center h-[56px] px-[16px] border-r border-[#e7eaed]">
                  <select className="bg-white border border-[#e7eaed] rounded-lg px-[8px] py-[4px] text-[14px] font-['Montserrat'] font-normal text-[#475569] cursor-pointer hover:border-[#f27f09]">
                    <option>En attente</option>
                    <option>Résolu</option>
                    <option>En cours</option>
                  </select>
                </div>
                <div className="flex items-center h-[56px] px-[8px] gap-[8px]">
                  <button className="w-[28px] h-[28px] flex items-center justify-center rounded hover:bg-gray-100">
                    <span className="text-[16px]">⋯</span>
                  </button>
                  <button className="w-[28px] h-[28px] flex items-center justify-center rounded hover:bg-gray-100">
                    <span className="text-[16px]">👁</span>
                  </button>
                  <button className="w-[28px] h-[28px] flex items-center justify-center rounded hover:bg-gray-100">
                    <span className="text-[16px]">✏️</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-[25px]">
          <Button variant="primary" size="sm">Actions groupées</Button>
          <Button variant="primary" size="sm">Voir tout</Button>
        </div>
      </div>

      {/* Dernières lois mises à jour */}
      <div className="space-y-[23px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-['Montserrat'] font-medium text-[#242a35]">Dernières lois mises à jour</h2>
          <div className="flex gap-[20px]">
            <div className="relative">
              <Button 
                size="sm" 
                variant="primary"
                onClick={() => setShowFilterLois(!showFilterLois)}
              >
                Filtres
              </Button>
              <FilterDropdown
                isOpen={showFilterLois}
                onClose={() => setShowFilterLois(false)}
                onApply={(filters) => {
                  setFilterLoisState(filters)
                  setShowFilterLois(false)
                }}
                onClear={() => {
                  setFilterLoisState(null)
                  setShowFilterLois(false)
                }}
                themes={types}
              />
            </div>
            
            <Button 
              size="sm" 
              variant="primary"
              onClick={() => setSortLois(sortLois === 'recent' ? 'ancien' : 'recent')}
            >
              {sortLois === 'recent' ? 'trier par : le plus récent' : 'trier par : le plus ancien'}
            </Button>
          </div>
        </div>

        {/* Lois cards */}
        <div className="grid grid-cols-2 gap-[73px]">
          {filteredLois.map((loi) => (
            <div key={loi.id} className="bg-white rounded-lg border border-[#e7eaed] px-[20px] py-[20px] space-y-[20px]">
              <p className="text-[16px] font-['Montserrat'] font-normal text-[#64748b] line-clamp-4 leading-[20px]">
                {loi.title}
              </p>
              
              <div className="bg-[#f5f5f5] border border-[#d1d5db] rounded-lg px-[12px] py-[6px] inline-block">
                <span className="text-[14px] font-['Montserrat'] font-medium text-[#242a35]">
                  {loi.category}
                </span>
              </div>
              
              <a
                href="#"
                className="inline-block text-[16px] font-['Montserrat'] font-medium text-[#787878] hover:text-[#f27f09] transition-colors"
              >
                lire plus
              </a>
            </div>
          ))}
        </div>

        {/* See all button */}
        <div className="flex justify-end pt-[25px]">
          <Button variant="primary" size="sm">Voir tout</Button>
        </div>
      </div>
    </main>
    </RoleProtectedPage>
  )
}

export default function Page() {
  return <MairieContent />
}
