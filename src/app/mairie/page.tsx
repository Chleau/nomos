'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import {
  StarIcon,
  EyeIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  PaperAirplaneIcon,
  ShareIcon,
  TrashIcon,
  ArchiveBoxIcon,
  PlusIcon,
  BarsArrowDownIcon,
} from '@heroicons/react/24/outline'

import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown'
import CardIncident from '@/components/ui/CardIncident'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { useAllSignalements } from '@/lib/hooks/useSignalements'
import { useTypesSignalement } from '@/lib/hooks/useTypesSignalement'
import { getPublicUrlFromPath } from '@/lib/services/storage.service'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { useRecentArretes, useDeleteArrete, useUpdateArrete } from '@/lib/hooks/useArretes'
import { CATEGORY_COLORS, ARRETE_CATEGORIES } from '@/lib/constants'
import { UserRole } from '@/types/auth'
import type { Signalement } from '@/types/signalements'
import { TableBadge, DataTable, type Column } from '@/components/ui/Table'

interface Redaction {
  id: number;
  title: string;
  date: Date;
  dateStr: string;
  category: string;
}

interface RedactionRow extends Redaction {
  numero: string;
  type: string;
  location: string;
  status: string;
  user: {
    initials: string;
    name: string;
    id: string;
  };
}

interface Loi {
  id: number;
  title: string;
  date: Date;
  category: string;
}

function ActionMenu({ row }: Readonly<{ row: RedactionRow }>) {
  const deleteArrete = useDeleteArrete()
  const updateArrete = useUpdateArrete()

  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      await deleteArrete.mutateAsync(row.id)
    }
    setIsOpen(false)
  }

  const handlePublish = async () => {
    await updateArrete.mutateAsync({ id: row.id, updates: { statut: 'Publié' } })
    setIsOpen(false)
  }

  const handleArchive = async () => {
    await updateArrete.mutateAsync({ id: row.id, updates: { archive: true, statut: 'Archivé' } })
    setIsOpen(false)
  }

  const handleShare = async () => {
    const url = `${globalThis.location.origin}/mairie/nouveau-arrete?id=${row.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: row.title, url })
      } catch (err) { console.error(err) }
    } else {
      await navigator.clipboard.writeText(url)
      alert("Lien copié !")
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${isOpen ? 'bg-gray-100 text-gray-600' : ''}`}
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <div className="px-4 py-2 text-xs font-bold text-gray-500 text-left border-b border-gray-50 mb-1">
            Actions
          </div>

          <button className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Télécharger
          </button>

          <button onClick={handlePublish} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-colors text-left w-full">
            <PaperAirplaneIcon className="w-4 h-4" />
            Publier
          </button>

          <button onClick={handleShare} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full">
            <ShareIcon className="w-4 h-4" />
            Partager
          </button>

          <button onClick={handleDelete} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-left w-full">
            <TrashIcon className="w-4 h-4" />
            Supprimer
          </button>
          <button onClick={handleArchive} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full">
            <ArchiveBoxIcon className="w-4 h-4" />
            Archiver
          </button>
        </div>
      )}
    </div>
  )
}

function MairieContent() {
  const router = useRouter()
  const { user } = useSupabaseAuth()
  const { data: habitant } = useCurrentHabitant(user?.id || null)
  const { types } = useTypesSignalement()

  const { data: derniersSignalements = [], isLoading: loadingAll } = useAllSignalements(2)
  const { data: arretes = [] } = useRecentArretes(habitant?.commune_id || null, 10)

  // États de tri
  const [sortIncidents] = useState<'recent' | 'ancien'>('recent')
  const [sortRedactions, setSortRedactions] = useState<'recent' | 'ancien'>('recent')
  const [sortLois, setSortLois] = useState<'recent' | 'ancien'>('recent')

  // États de filtre
  const [filterIncidents] = useState<FilterState | null>(null) // Non utilisé dans l'UI pour le moment
  const [filterRedactionsState, setFilterRedactionsState] = useState<FilterState | null>(null)
  const [filterLoisState, setFilterLoisState] = useState<FilterState | null>(null)

  // Modales de filtre
  const [showFilterRedactions, setShowFilterRedactions] = useState(false)
  const [showFilterLois, setShowFilterLois] = useState(false)

  // États pour les checkboxes de la table
  const [selectedRedactions, setSelectedRedactions] = useState<Set<string | number>>(new Set())
  const [favorites, setFavorites] = useState<Set<string | number>>(new Set())

  // --- Helpers ---

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date inconnue'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR')
  }

  const getStatut = (statut: string | null | undefined): 'En cours' | 'Résolu' | 'Signalé' => {
    if (!statut) return 'Signalé'
    if (statut.toLowerCase().includes('résolu') || statut.toLowerCase().includes('resolu')) return 'Résolu'
    if (statut.toLowerCase().includes('cours')) return 'En cours'
    return 'Signalé'
  }

  const getBadgeColor = (category: string) => {
    return CATEGORY_COLORS[category] || 'neutral'
  }

  const getStatusColor = (status: string | undefined): 'success' | 'neutral' | 'warning' => {
    if (status === 'Publié') return 'success'
    if (status === 'Archivé') return 'neutral'
    return 'warning'
  }

  // --- Data Transformation ---

  // 1. Prepare raw data
  const redactions: RedactionRow[] = (arretes || []).map((arrete) => {
    const date = new Date(arrete.date_creation)
    const habitant = arrete.auteur?.habitant
    const initials = habitant
      ? (`${habitant.prenom.charAt(0)}${habitant.nom.charAt(0)}`).toUpperCase()
      : '??'
    const name = habitant
      ? `${habitant.prenom} ${habitant.nom}`
      : 'Inconnu'

    return {
      id: arrete.id,
      numero: arrete.numero,
      type: arrete.type,
      title: arrete.titre,
      date: date,
      dateStr: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      category: arrete.categorie || 'Sans catégorie',
      location: 'Mairie',
      status: arrete.statut,
      user: {
        initials,
        name,
        id: arrete.auteur_id || '?'
      }
    }
  })

  // Mock lois
  const lois: Loi[] = Array.from({ length: 2 }).map((_, i) => ({
    id: i + 1,
    title: "LOI organique n° 2022-400 du 21 mars 2022 visant à renforcer le rôle du Défenseur des droits en matière de signalement d'alerte",
    date: new Date(1735689600000 - i * 7 * 24 * 60 * 60 * 1000), // Fixed date
    category: 'Droit'
  }))

  // 2. Sort & Filter Functions
  const sortSignalementsList = (signalements: Signalement[] | null) => {
    if (!signalements) return []
    const sorted = [...signalements]
    if (sortIncidents === 'recent') {
      sorted.sort((a, b) => new Date(b.date_signalement || 0).getTime() - new Date(a.date_signalement || 0).getTime())
    } else {
      sorted.sort((a, b) => new Date(a.date_signalement || 0).getTime() - new Date(b.date_signalement || 0).getTime())
    }
    return sorted
  }

  const sortRedactionsArray = (items: RedactionRow[]) => {
    const sorted = [...items]
    if (sortRedactions === 'recent') {
      sorted.sort((a, b) => b.date.getTime() - a.date.getTime())
    } else {
      sorted.sort((a, b) => a.date.getTime() - b.date.getTime())
    }
    return sorted
  }

  const sortLoisArray = (items: Loi[]) => {
    const sorted = [...items]
    if (sortLois === 'recent') {
      sorted.sort((a, b) => b.date.getTime() - a.date.getTime())
    } else {
      sorted.sort((a, b) => a.date.getTime() - b.date.getTime())
    }
    return sorted
  }

  const filterSignalementsList = (signalements: Signalement[]) => {
    if (!filterIncidents) return signalements
    let filtered = signalements

    // Filtre par dates
    if (filterIncidents.startDate || filterIncidents.endDate) {
      filtered = filtered.filter(s => {
        const signalDate = new Date(s.date_signalement || 0)
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

  const filterRedactionsArray = (items: RedactionRow[]) => {
    if (!filterRedactionsState) return items
    let filtered = items

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
    if (filterRedactionsState.themes && filterRedactionsState.themes.length > 0) {
      filtered = filtered.filter(r =>
        filterRedactionsState.themes.includes(r.category)
      )
    }
    return filtered
  }

  const filterLoisArray = (items: Loi[]) => {
    if (!filterLoisState) return items
    let filtered = items

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
    if (filterLoisState.themes && filterLoisState.themes.length > 0) {
      filtered = filtered.filter(l =>
        filterLoisState.themes.includes(l.category)
      )
    }
    return filtered
  }

  // 3. Apply Transformations
  const sortedSignalements = sortSignalementsList(derniersSignalements)
  const sortedRedactions = sortRedactionsArray(redactions)
  const sortedLois = sortLoisArray(lois)

  const filteredSignalements = filterSignalementsList(sortedSignalements)
  const filteredRedactions = filterRedactionsArray(sortedRedactions)
  const filteredLois = filterLoisArray(sortedLois)


  // --- Event Handlers that rely on filteredRedactions ---

  const toggleRedactionSelection = (id: string | number) => {
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

  const toggleFavorite = (id: string | number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  // --- Columns Configuration ---

  const columns: Column<RedactionRow>[] = [
    {
      header: '',
      width: '5%',
      align: 'center',
      render: (row) => (
        <Checkbox
          checked={selectedRedactions.has(row.id)}
          onChange={() => toggleRedactionSelection(row.id)}
        />
      )
    },
    {
      header: 'Favoris',
      width: '7%',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => toggleFavorite(row.id)}
          className={`p-1 rounded-full transition-colors ${favorites.has(row.id) ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
        >
          <StarIcon className={`w-5 h-5 ${favorites.has(row.id) ? 'fill-current' : ''}`} />
        </button>
      )
    },
    {
      header: 'Nom',
      align: 'left',
      render: (row) => (
        <span className="text-sm font-medium text-[#242a35] line-clamp-1" title={row.title}>
          {row.title}
        </span>
      ),
      width: '35%'
    },
    {
      header: 'Date',
      align: 'left',
      render: (row) => (
        <span suppressHydrationWarning>
          {row.dateStr}
        </span>
      ),
      width: '15%'
    },
    {
      header: 'Statut',
      align: 'left',
      render: (row) => (
        <TableBadge
          label={row.status || 'Brouillon'}
          color={getStatusColor(row.status)}
        />
      ),
      width: '20%'
    },
    {
      header: 'Catégorie',
      align: 'left',
      render: (row) => <TableBadge label={row.category} color={getBadgeColor(row.category)} />,
      width: '20%'
    },

    {
      header: 'Action',
      align: 'center',
      render: (row: RedactionRow) => (
        <div className="flex items-center gap-2">
          <ActionMenu row={row} />
          <button
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
            title="Voir"
            onClick={() => router.push(`/mairie/nouveau-arrete?id=${row.id}&mode=view`)}
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
            title="Modifier"
            onClick={() => router.push(`/mairie/nouveau-arrete?id=${row.id}`)}
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      ),
      width: '15%'
    }
  ];

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
            <Button size="xs" variant="outline"> Anciens arrêtés</Button>
            <Button size="xs" variant="outline"> Anciennes délibérations</Button>
          </div>
        </div>

        {/* Derniers incidents déclarés */}
        <div className="mb-[58px] space-y-[25px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[30px] font-['Poppins'] font-medium text-[#4a4a4a]">Derniers incidents déclarés</h2>
          </div>

          {loadingAll && <div className="text-gray-500">Chargement...</div>}

          {!loadingAll && derniersSignalements && derniersSignalements.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[58px]">
                {filteredSignalements.slice(0, 2).map((signalement) => {
                  const firstPhotoPath = signalement.photos_signalement?.[0]?.url
                  const imageUrl = firstPhotoPath ? getPublicUrlFromPath(firstPhotoPath) : undefined
                  const userName = signalement.prenom ? `${signalement.prenom} ${signalement.nom}` : 'Anonyme'

                  return (
                    <CardIncident
                      key={signalement.id}
                      image={imageUrl}
                      title={signalement.titre || 'Sans titre'}
                      label={getStatut(signalement.statut)}
                      date={formatDate(signalement.date_signalement || null)}
                      username={userName}
                      description={signalement.description || 'Aucune description'}
                      backgroundColor={!signalement.valide ? 'bg-[#F1F5F9]' : 'bg-white'}
                      onClick={() => router.push(`/mairie/signalement-habitants/${signalement.id}`)}
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
          )}

          {!loadingAll && (!derniersSignalements || derniersSignalements.length === 0) && (
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
                  variant="outline"
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
                  categories={[...ARRETE_CATEGORIES]}
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSortRedactions(sortRedactions === 'recent' ? 'ancien' : 'recent')}
              >
                <BarsArrowDownIcon className="w-5 h-5" />

                {sortRedactions === 'recent' ? 'trier par : le plus récent' : 'trier par : le plus ancien'}
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => router.push('/mairie/nouveau-arrete')}
              >
                <PlusIcon className="w-5 h-5" />
                Nouveau
              </Button>            </div>
          </div>

          {/* Redactions table */}
          <div className="bg-white rounded-lg overflow-hidden border border-[#e7eaed]">
            <DataTable
              columns={columns}
              data={filteredRedactions}
              emptyMessage="Aucune rédaction trouvée"
              headerCheckbox={
                <Checkbox
                  checked={filteredRedactions.length > 0 && selectedRedactions.size === filteredRedactions.length}
                  state={selectedRedactions.size > 0 && selectedRedactions.size < filteredRedactions.length ? 'indeterminate' : undefined}
                  onChange={toggleSelectAllRedactions}
                />
              }
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-[25px]">
            <Button variant="outline" size="sm">Actions groupées</Button>
            <Button variant="primary" size="sm">Voir tout</Button>
          </div>
        </div>

        {/* Dernières lois mises à jour */}
        <div className="mb-[58px] space-y-[23px]">
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-['Montserrat'] font-medium text-[#242a35]">Dernières lois mises à jour</h2>
            <div className="flex gap-[20px]">
              <div className="relative">
                <Button
                  size="sm"
                  variant="outline"
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
                  categories={[...ARRETE_CATEGORIES]}
                />
              </div>

              <Button
                size="sm"
                variant="outline"
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

                <Link
                  href="#"
                  className="inline-block text-[16px] font-['Montserrat'] font-medium text-[#787878] hover:text-[#f27f09] transition-colors"
                >
                  lire plus
                </Link>
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
