'use client'

import React, { useState, useRef, useEffect } from 'react'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import {
  DataTable,
  Column,
  TableBadge
} from '@/components/ui/Table'
import Checkbox from '@/components/ui/Checkbox'
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown'
import {
  PencilIcon,
  EyeIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
  ArchiveBoxIcon,
  PaperAirplaneIcon,
  StarIcon,
  AdjustmentsVerticalIcon,
  BarsArrowDownIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { useArretes, useDeleteArrete, useUpdateArrete } from '@/lib/hooks/useArretes'
import Button from '@/components/ui/Button'
import { ARRETE_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants'

// Type local pour les données du tableau
interface RedactionRow {
  id: number | string
  titre: string
  reference: string
  categorie: string
  date: string
  statut: string
  favori: boolean
  rawDate: Date
}

// Helper pour mapper les couleurs de badge
const getCategoryColor = (categorie: string): 'neutral' | 'warning' | 'error' | 'success' | 'info' | 'purple' | 'orange' | 'blue' | 'pink' | 'indigo' | 'teal' => {
  return (CATEGORY_COLORS[categorie] as 'neutral' | 'warning' | 'error' | 'success' | 'info' | 'purple' | 'orange' | 'blue' | 'pink' | 'indigo' | 'teal') || 'neutral'
}

function ActionMenu({ row }: { row: RedactionRow }) {
  const router = useRouter()
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
      await deleteArrete.mutateAsync(row.id as number)
    }
    setIsOpen(false)
  }

  const handlePublish = async () => {
    await updateArrete.mutateAsync({ id: row.id as number, updates: { statut: 'Publié' } })
    setIsOpen(false)
  }

  const handleArchive = async () => {
    await updateArrete.mutateAsync({ id: row.id as number, updates: { archive: true, statut: 'Archivé' } })
    setIsOpen(false)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/mairie/nouveau-arrete?id=${row.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: row.titre, url })
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

export default function DerniereRedactionsPage() {
  const router = useRouter()
  const { user } = useSupabaseAuth()
  const { data: habitant } = useCurrentHabitant(user?.id || null)
  const { data: arretes = [], isLoading } = useArretes(habitant?.commune_id || null)
  const deleteArrete = useDeleteArrete()
  const updateArrete = useUpdateArrete()

  const [selectedRedactions, setSelectedRedactions] = useState<Set<string | number>>(new Set())
  const [filterState, setFilterState] = useState<FilterState | null>(null)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'recent' | 'ancien'>('recent')
  const [searchTerm, setSearchTerm] = useState('')

  // State pour les favoris (persistance locale)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

  // Chargement des favoris au démarrage
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const stored = localStorage.getItem(`favorites_arretes_${user.id}`)
      if (stored) {
        try {
          setFavorites(new Set(JSON.parse(stored)))
        } catch (e) {
          console.error("Erreur lecture favoris", e)
        }
      }
    }
  }, [user?.id])

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)

    // Sauvegarde
    if (typeof window !== 'undefined' && user?.id) {
      localStorage.setItem(`favorites_arretes_${user.id}`, JSON.stringify(Array.from(newFavorites)))
    }
  }

  // State pour le menu d'actions groupées
  const [isGroupActionsOpen, setIsGroupActionsOpen] = useState(false)
  const groupActionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (groupActionsRef.current && !groupActionsRef.current.contains(event.target as Node)) {
        setIsGroupActionsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])


  // Transformation des données
  const redactions: RedactionRow[] = (arretes || []).map(arrete => {
    const date = new Date(arrete.date_creation)
    return {
      id: arrete.id,
      titre: arrete.titre,
      reference: arrete.numero || `ARR-${arrete.id}`,
      categorie: arrete.categorie || 'Sans catégorie',
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      rawDate: date,
      statut: arrete.statut || 'Brouillon',
      favori: favorites.has(arrete.id),
      auteur: {
        initials: '?',
        name: '?',
        email: ''
      }
    }
  })

  // Tri
  const sortedRedactions = [...redactions].sort((a, b) => {
    if (sortOrder === 'recent') {
      return b.rawDate.getTime() - a.rawDate.getTime()
    } else {
      return a.rawDate.getTime() - b.rawDate.getTime()
    }
  })

  const filterRedactions = (items: RedactionRow[]) => {
    let filtered = items

    // Recherche textuelle
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        r.titre.toLowerCase().includes(lowerTerm) ||
        r.reference.toLowerCase().includes(lowerTerm)
      )
    }

    // Filtre par catégorie (barre horizontale)
    if (activeCategory) {
      if (activeCategory === 'Mes favoris') {
        filtered = filtered.filter(r => r.favori)
      } else {
        filtered = filtered.filter(r => r.categorie === activeCategory)
      }
    }

    if (!filterState) return filtered

    // Filtre par dates
    if (filterState.startDate || filterState.endDate) {
      filtered = filtered.filter(r => {
        const rDate = r.rawDate
        if (filterState.startDate) {
          const startDate = new Date(filterState.startDate)
          if (rDate < startDate) return false
        }
        if (filterState.endDate) {
          const endDate = new Date(filterState.endDate)
          endDate.setHours(23, 59, 59, 999)
          if (rDate > endDate) return false
        }
        return true
      })
    }

    // Filtre par thèmes (catégories via dropdown)
    if (filterState.themes && filterState.themes.length > 0) {
      filtered = filtered.filter(r =>
        filterState.themes!.includes(r.categorie)
      )
    }

    return filtered
  }

  const filteredRedactions = filterRedactions(sortedRedactions)

  // Handlers pour actions groupées
  const handleGroupView = () => {
    const ids = Array.from(selectedRedactions)
    let blockedCount = 0

    ids.forEach((id) => {
      const w = window.open(`/mairie/nouveau-arrete?id=${id}&mode=view`, '_blank')
      if (!w) blockedCount++
    })

    if (blockedCount > 0) {
      alert(`Attention : ${blockedCount} onglet(s) bloqué(s) par le navigateur.\n\nVeuillez autoriser les "pop-ups" pour ce site (icône dans la barre d'adresse) afin d'ouvrir plusieurs documents simultanément.`)
    }
    setIsGroupActionsOpen(false)
  }

  const handleGroupEdit = () => {
    const ids = Array.from(selectedRedactions)
    let blockedCount = 0

    ids.forEach((id) => {
      const w = window.open(`/mairie/nouveau-arrete?id=${id}`, '_blank')
      if (!w) blockedCount++
    })

    if (blockedCount > 0) {
      alert(`Attention : ${blockedCount} onglet(s) bloqué(s) par le navigateur.\n\nVeuillez autoriser les "pop-ups" pour ce site (icône dans la barre d'adresse) afin d'ouvrir plusieurs documents simultanément.`)
    }
    setIsGroupActionsOpen(false)
  }

  const handleGroupDownload = () => {
    selectedRedactions.forEach(id => {
      const arrete = (arretes || []).find(a => a.id === id)
      if (arrete) {
        const element = document.createElement("a");
        const file = new Blob([arrete.contenu || ''], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${arrete.titre || 'document'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    })
    setIsGroupActionsOpen(false)
  }

  const handleGroupShare = async () => {
    // Pour le partage de masse, on copie les liens dans le presse-papier un par un (limitation navigateur)
    // Ou on affiche une alerte pour dire que ce n'est pas pleinement supporté en masse par l'API Web Share
    const links: string[] = []
    for (const id of selectedRedactions) {
      links.push(`${window.location.origin}/mairie/nouveau-arrete?id=${id}`)
    }

    if (links.length === 1 && navigator.share) {
      const arrete = (arretes || []).find(a => a.id === Array.from(selectedRedactions)[0])
      navigator.share({ title: arrete?.titre, url: links[0] }).catch(console.error)
    } else {
      await navigator.clipboard.writeText(links.join('\n'))
      alert(`${links.length} liens copiés dans le presse-papier !`)
    }
    setIsGroupActionsOpen(false)
  }

  const handleGroupDelete = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRedactions.size} documents ?`)) {
      const promises = Array.from(selectedRedactions).map(id => deleteArrete.mutateAsync(id as number))
      await Promise.all(promises)
      setSelectedRedactions(new Set())
    }
    setIsGroupActionsOpen(false)
  }

  const handleGroupArchive = async () => {
    if (confirm(`Êtes-vous sûr de vouloir archiver ${selectedRedactions.size} documents ?`)) {
      const promises = Array.from(selectedRedactions).map(id =>
        updateArrete.mutateAsync({ id: id as number, updates: { archive: true, statut: 'Archivé' } })
      )
      await Promise.all(promises)
      setSelectedRedactions(new Set())
    }
    setIsGroupActionsOpen(false)
  }

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
          className="text-yellow-400 hover:text-yellow-500"
          onClick={(e) => { e.stopPropagation(); toggleFavorite(row.id as number) }}
        >
          {row.favori ? (
            <StarIcon className="w-5 h-5 fill-current" />
          ) : (
            <StarIcon className="w-5 h-5" />
          )}
        </button>
      )
    },
    {
      header: 'Nom',
      width: '35%',
      render: (row) => (
        <span className="text-sm font-medium text-[#242a35] line-clamp-1" title={row.titre}>
          {row.titre}
        </span>
      )
    },
    {
      header: 'Date',
      width: '15%',
      accessorKey: 'date'
    },
    {
      header: 'Statut',
      width: '20%',
      render: (row) => (
        <TableBadge
          label={row.statut || 'Brouillon'}
          color={
            row.statut === 'Validé' || row.statut === 'Publié' ? 'success'
              : row.statut === 'Archivé' ? 'neutral'
                : 'warning'
          }
        />
      )
    },
    {
      header: 'Catégorie',
      width: '20%',
      render: (row) => (
        <TableBadge color={getCategoryColor(row.categorie)} label={row.categorie} />
      )
    },
    {
      header: 'Action',
      align: 'center',
      width: '15%',
      render: (row) => (
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
      )
    }
  ]

  const headerCheckbox = (
    <Checkbox
      checked={filteredRedactions.length > 0 && selectedRedactions.size === filteredRedactions.length}
      state={selectedRedactions.size > 0 && selectedRedactions.size < filteredRedactions.length ? 'indeterminate' : undefined}
      onChange={toggleSelectAllRedactions}
    />
  )

  return (
    <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
      <div className="p-8 space-y-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-[32px] font-bold text-[#242a35] font-['Montserrat']">Mes dernières rédactions</h1>

          <div className="flex justify-end gap-3 items-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#f27f09] focus:border-transparent w-full max-w-[200px]"
              />
            </div>


            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <AdjustmentsVerticalIcon className="w-5 h-5" />
                Filtres
              </Button>
              <FilterDropdown
                isOpen={showFilterDropdown}
                onClose={() => setShowFilterDropdown(false)}
                categories={[...ARRETE_CATEGORIES]}
                onApply={(filters) => {
                  setFilterState(filters)
                  setShowFilterDropdown(false)
                }}
                onClear={() => {
                  setFilterState(null)
                  setShowFilterDropdown(false)
                }}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              onClick={() => setSortOrder(sortOrder === 'recent' ? 'ancien' : 'recent')}
            >
              <BarsArrowDownIcon className={`w-5 h-5 transition-transform ${sortOrder === 'ancien' ? 'rotate-180' : ''}`} />
              {sortOrder === 'recent' ? 'Trier par : le plus récent' : 'Trier par : le plus ancien'}
            </Button>

            <Button
              className="gap-2 bg-[#e67e22] hover:bg-[#d35400] text-white border-none shadow-sm"
              onClick={() => router.push('/mairie/nouveau-arrete')}
            >
              <PlusIcon className="w-5 h-5" />
              Nouveau
            </Button>
          </div>

          <div className="flex items-center gap-2 w-full">
            <div className="flex gap-2 overflow-x-auto items-center flex-1 no-scrollbar">
              <button
                onClick={() => setActiveCategory(activeCategory === 'Mes favoris' ? null : 'Mes favoris')}
                className={`
                            whitespace-nowrap px-4 py-2 rounded-md text-sm border transition-colors flex items-center gap-2
                            ${activeCategory === 'Mes favoris'
                    ? 'bg-[#fffbeb] text-[#d97706] border-[#fcd34d]'
                    : 'bg-[#fffbeb] text-[#d97706] border-[#fcd34d] hover:bg-[#fff9c4]'}
                        `}
              >
                <StarIcon className="w-4 h-4" />
                Mes favoris
              </button>

              {ARRETE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`
                                whitespace-nowrap px-4 py-2 rounded-md text-sm border transition-colors flex items-center gap-2
                                ${activeCategory === cat
                      ? 'bg-[#E5E7EB] text-[#1F2937] border-gray-300 font-medium'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                            `}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="shrink-0 ml-2 relative" ref={groupActionsRef}>
              <button
                onClick={() => setIsGroupActionsOpen(!isGroupActionsOpen)}
                className={`whitespace-nowrap px-4 py-2 rounded-md text-sm border transition-colors flex items-center gap-2 
                            ${selectedRedactions.size > 0
                    ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}
                        `}
              >
                Action groupées {selectedRedactions.size > 0 && `(${selectedRedactions.size})`}
                <ChevronDownIcon className="w-4 h-4" />
              </button>

              {isGroupActionsOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-100 shadow-xl rounded-xl z-50 flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                  <div className="px-4 py-2 text-xs font-bold text-gray-500 text-left border-b border-gray-50 mb-1">
                    {selectedRedactions.size === 0 ? 'Aucun élément sélectionné' : `Actions pour ${selectedRedactions.size} éléments`}
                  </div>

                  {selectedRedactions.size > 0 ? (
                    <>
                      <button onClick={handleGroupView} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full">
                        <EyeIcon className="w-4 h-4" />
                        Consulter
                      </button>
                      <button onClick={handleGroupEdit} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full">
                        <PencilIcon className="w-4 h-4" />
                        Modifier
                      </button>
                      <button onClick={handleGroupDownload} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full">
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        Télécharger
                      </button>
                      <button onClick={handleGroupShare} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full">
                        <ShareIcon className="w-4 h-4" />
                        Partager
                      </button>
                      <div className="h-px bg-gray-100 my-1"></div>
                      <button onClick={handleGroupArchive} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full">
                        <ArchiveBoxIcon className="w-4 h-4" />
                        Archiver
                      </button>
                      <button onClick={handleGroupDelete} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-left w-full">
                        <TrashIcon className="w-4 h-4" />
                        Supprimer
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center italic">
                      Cochez des cases dans le tableau pour activer les actions.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Chargement...</div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredRedactions}
              headerCheckbox={headerCheckbox}
            />
          )}
        </div>

        {/* Pagination simulée */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
          <span>Affichage de {filteredRedactions.length > 0 ? 1 : 0} à {filteredRedactions.length} sur {filteredRedactions.length} résultats</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Précédent</button>
            <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50" disabled>Suivant</button>
          </div>
        </div>
      </div>
    </RoleProtectedPage>
  );
}
