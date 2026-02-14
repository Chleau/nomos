'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown'
import {
  DataTable,
  Column,
  TableBadge
} from '@/components/ui/Table'
import {
  FiClock,
  FiMapPin
} from 'react-icons/fi'

import {
  PencilIcon,
  EyeIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  TrashIcon,
  ArchiveBoxIcon,
  StarIcon,
  AdjustmentsVerticalIcon,
  BarsArrowDownIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { BiImport } from 'react-icons/bi'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { useArretes, useDeleteArrete, useUpdateArrete } from '@/lib/hooks/useArretes'
import { ARRETE_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants'

interface ArchiveRow {
  id: number | string
  titre: string
  reference: string
  categorie: string
  date: string
  statut: string
  favori: boolean
  rawDate: Date
  agent?: { nom: string }
  collectivite?: string
}

// Helper pour mapper les couleurs de badge
const getCategoryColor = (categorie: string): 'neutral' | 'warning' | 'error' | 'success' | 'info' | 'purple' | 'orange' | 'blue' | 'pink' | 'indigo' | 'teal' | 'rose' | 'cyan' => {
  return (CATEGORY_COLORS[categorie] as 'neutral' | 'warning' | 'error' | 'success' | 'info' | 'purple' | 'orange' | 'blue' | 'pink' | 'indigo' | 'teal' | 'rose' | 'cyan') || 'neutral'
}
function ActionMenu({ row }: { row: ArchiveRow }) {
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
    if (confirm("Êtes-vous sûr de vouloir supprimer cette archive ?")) {
      await deleteArrete.mutateAsync(row.id as number)
    }
    setIsOpen(false)
  }

  const handleUnarchive = async () => {
    if (confirm("Êtes-vous sûr de vouloir désarchiver ce document ? Il redeviendra un brouillon.")) {
      await updateArrete.mutateAsync({ id: row.id as number, updates: { archive: false, statut: 'Brouillon' } })
    }
    setIsOpen(false)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/mairie/archives/${row.id}`
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
        aria-label="Actions"
        className={`p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${isOpen ? 'bg-gray-100 text-gray-600' : ''}`}
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-100 shadow-xl rounded-xl z-50 flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
          <div className="px-4 py-2 text-xs font-bold text-gray-500 text-left border-b border-gray-50 mb-1">
            Actions
          </div>

          <button
            onClick={() => router.push(`/mairie/archives/${row.id}?mode=view`)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full"
          >
            <EyeIcon className="w-4 h-4" />
            Consulter
          </button>

          <button
            onClick={() => router.push(`/mairie/archives/${row.id}?mode=edit`)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full"
          >
            <PencilIcon className="w-4 h-4" />
            Modifier
          </button>

          <button onClick={handleShare} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#242a35] transition-colors text-left w-full">
            <ShareIcon className="w-4 h-4" />
            Partager
          </button>

          <button onClick={handleUnarchive} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors text-left w-full">
            <ArchiveBoxIcon className="w-4 h-4" />
            Désarchiver
          </button>

          <button onClick={handleDelete} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors text-left w-full">
            <TrashIcon className="w-4 h-4" />
            Supprimer
          </button>
        </div>
      )}
    </div>
  )
}
export default function ArchivesPage() {
  const router = useRouter()
  const { user } = useSupabaseAuth()
  const { data: habitant } = useCurrentHabitant(user?.id || null)
  const { data: arretes, isLoading } = useArretes(habitant?.commune_id || null)
  const deleteArrete = useDeleteArrete()
  const updateArrete = useUpdateArrete()

  // States
  const [selectedArchives, setSelectedArchives] = useState<Set<string | number>>(new Set())
  const [filterState, setFilterState] = useState<FilterState | null>(null)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'recent' | 'ancien'>('recent')
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 15

  // State pour le menu d'actions groupées
  const [isGroupActionsOpen, setIsGroupActionsOpen] = useState(false)
  const groupActionsRef = useRef<HTMLDivElement>(null)

  // Chargement des favoris au démarrage
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id) {
      const stored = localStorage.getItem(`favorites_archives_${user.id}`)
      if (stored) {
        try {
          setFavorites(new Set(JSON.parse(stored)))
        } catch (e) {
          console.error("Erreur lecture favoris", e)
        }
      }
    }
  }, [user?.id])

  // Gestion du clic extérieur pour le menu d'actions groupées
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (groupActionsRef.current && !groupActionsRef.current.contains(event.target as Node)) {
        setIsGroupActionsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

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
      localStorage.setItem(`favorites_archives_${user.id}`, JSON.stringify(Array.from(newFavorites)))
    }
  }

  // Transformation et filtrage des données
  const archives: ArchiveRow[] = useMemo(() => {
    if (!arretes) return []
    return arretes
      .filter(a => a.archive === true)
      .map(arrete => {
        const date = new Date(arrete.date_creation)
        return {
          id: arrete.id,
          titre: arrete.titre,
          reference: arrete.numero || `ARR-${arrete.id}`,
          categorie: arrete.categorie || 'Sans catégorie',
          date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
          rawDate: date,
          statut: arrete.statut || 'Archivé',
          favori: favorites.has(arrete.id),
          agent: arrete.agent,
          collectivite: (arrete as any).communes?.nom
        }
      })
  }, [arretes, favorites])

  // Tri
  const sortedArchives = useMemo(() => {
    return [...archives].sort((a, b) => {
      if (sortOrder === 'recent') {
        return b.rawDate.getTime() - a.rawDate.getTime()
      } else {
        return a.rawDate.getTime() - b.rawDate.getTime()
      }
    })
  }, [archives, sortOrder])

  // Filtrage
  const filteredArchives = useMemo(() => {
    let filtered = sortedArchives

    // Recherche textuelle
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(r =>
        (r.titre && r.titre.toLowerCase().includes(lowerTerm)) ||
        (r.reference && r.reference.toLowerCase().includes(lowerTerm))
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
  }, [sortedArchives, searchTerm, activeCategory, filterState])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeCategory, filterState, sortOrder])

  const paginatedArchives = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredArchives.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredArchives, currentPage])

  const handleSelectAll = () => {
    if (selectedArchives.size === filteredArchives.length) {
      setSelectedArchives(new Set())
    } else {
      setSelectedArchives(new Set(filteredArchives.map(r => r.id)))
    }
  }

  const handleSelectRow = (id: string | number) => {
    const newSelected = new Set(selectedArchives)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedArchives(newSelected)
  }

  // Handlers pour actions groupées
  const handleGroupView = () => {
    const ids = Array.from(selectedArchives)
    let blockedCount = 0

    ids.forEach((id) => {
      const w = window.open(`/mairie/archives/${id}?mode=view`, '_blank')
      if (!w) blockedCount++
    })

    if (blockedCount > 0) {
      alert(`Attention : ${blockedCount} onglet(s) bloqué(s) par le navigateur.\n\nVeuillez autoriser les "pop-ups" pour ce site (icône dans la barre d'adresse) afin d'ouvrir plusieurs documents simultanément.`)
    }
    setIsGroupActionsOpen(false)
  }

  const handleGroupEdit = () => {
    const ids = Array.from(selectedArchives)
    let blockedCount = 0

    ids.forEach((id) => {
      const w = window.open(`/mairie/archives/${id}?mode=edit`, '_blank')
      if (!w) blockedCount++
    })

    if (blockedCount > 0) {
      alert(`Attention : ${blockedCount} onglet(s) bloqué(s) par le navigateur.\n\nVeuillez autoriser les "pop-ups" pour ce site (icône dans la barre d'adresse) afin d'ouvrir plusieurs documents simultanément.`)
    }
    setIsGroupActionsOpen(false)
  }

  const handleGroupDownload = () => {
    selectedArchives.forEach(id => {
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
    const links: string[] = []
    for (const id of selectedArchives) {
      links.push(`${window.location.origin}/mairie/archives/${id}`)
    }

    if (links.length === 1 && navigator.share) {
      const arrete = (arretes || []).find(a => a.id === Array.from(selectedArchives)[0])
      navigator.share({ title: arrete?.titre, url: links[0] }).catch(console.error)
    } else {
      await navigator.clipboard.writeText(links.join('\n'))
      alert(`${links.length} liens copiés dans le presse-papier !`)
    }
    setIsGroupActionsOpen(false)
  }

  const handleGroupDelete = async () => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedArchives.size} archives ?`)) {
      const promises = Array.from(selectedArchives).map(id => deleteArrete.mutateAsync(id as number))
      await Promise.all(promises)
      setSelectedArchives(new Set())
    }
    setIsGroupActionsOpen(false)
  }

  const handleGroupUnarchive = async () => {
    if (confirm(`Êtes-vous sûr de vouloir désarchiver ${selectedArchives.size} documents ?`)) {
      const promises = Array.from(selectedArchives).map(id =>
        updateArrete.mutateAsync({ id: id as number, updates: { archive: false, statut: 'Brouillon' } })
      )
      await Promise.all(promises)
      setSelectedArchives(new Set())
    }
    setIsGroupActionsOpen(false)
  }

  const columns: Column<ArchiveRow>[] = [
    {
      header: '',
      width: '5%',
      align: 'center',
      render: (row) => (
        <Checkbox
          checked={selectedArchives.has(row.id)}
          onChange={() => handleSelectRow(row.id)}
        />
      )
    },
    {
      header: 'Favoris',
      width: '6%',
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
      width: '22%',
      render: (row) => (
        <span className="text-sm font-medium text-[#242a35] line-clamp-1" title={row.titre}>
          {row.titre || 'Sans titre'}
        </span>
      )
    },
    {
      header: 'Date',
      width: '10%',
      accessorKey: 'date',
      render: (row) => <span className="text-slate-500">{row.date}</span>
    },
    {
      header: 'Catégorie',
      width: '13%',
      render: (row) => (
        <TableBadge
          label={row.categorie || 'Sans catégorie'}
          color={getCategoryColor(row.categorie)}
        />
      )
    },
    {
      header: 'Collectivité',
      width: '12%',
      render: (row) => (
        <div className="flex items-center gap-1 text-slate-600">
          <FiMapPin />
          <span>{row.collectivite || 'Commune'}</span>
        </div>
      )
    },
    {
      header: 'Action',
      align: 'center',
      width: '10%',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <ActionMenu row={row} />
          <button
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
            title="Consulter"
            onClick={() => router.push(`/mairie/archives/${row.id}?mode=view`)}
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"
            title="Modifier"
            onClick={() => router.push(`/mairie/archives/${row.id}?mode=edit`)}
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ]

  const headerCheckbox = (
    <Checkbox
      checked={filteredArchives.length > 0 && selectedArchives.size === filteredArchives.length}
      state={selectedArchives.size > 0 && selectedArchives.size < filteredArchives.length ? 'indeterminate' : undefined}
      onChange={handleSelectAll}
    />
  )

  return (
    <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
      <div className="p-8 w-full max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-[32px] font-bold text-[#242a35]">Toutes les archives</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#16a34a] bg-green-50 px-3 py-1 rounded-md border border-green-200">
              Dernière mise à jour le {new Date().toLocaleDateString()}
            </span>
            <Button
              className="flex items-center gap-2 text-slate-600 border-slate-800 font-size-xs hover:bg-gray-50"
              variant="outline"
              size="xs"
              onClick={() => router.push('/mairie/archives/historique')}
            >
              <FiClock />
              Historique des imports
            </Button>
          </div>
        </div>

        {/* ici !! */}
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
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#f27f09] focus:border-transparent w-full  w-[150px] h-[32px]"
            />
          </div>


          <div className="relative">
            <Button
              variant="outline"
              size="xs"
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
            size="xs"
            className="gap-2 bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            onClick={() => setSortOrder(sortOrder === 'recent' ? 'ancien' : 'recent')}
          >
            <BarsArrowDownIcon className={`w-5 h-5 transition-transform ${sortOrder === 'ancien' ? 'rotate-180' : ''}`} />
            {sortOrder === 'recent' ? 'Trier par : le plus récent' : 'Trier par : le plus ancien'}
          </Button>

          <Button
            size="xs" variant='primary'
            className="items-center text-medium gap-2"
            onClick={() => router.push('/mairie/archives/importer')}
          >
            <BiImport className="text-lg" />
            Importer des archives
          </Button>
        </div>

        {/* Categories / Tags */}
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
              {activeCategory === 'Mes favoris' ? <XMarkIcon className="w-4 h-4" /> : <StarIcon className="w-4 h-4" />}
              Mes favoris
            </button>

            {ARRETE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`
                  whitespace-nowrap px-4 py-2 rounded-md text-sm border transition-colors flex items-center gap-2
                  ${activeCategory === cat
                    ? 'bg-[#e67e22] text-[#242a35] border-[#e67e22] font-medium'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                `}
              >
                {activeCategory === cat && <XMarkIcon className="w-4 h-4" />}
                {cat}
              </button>
            ))}
          </div>

          <div className="shrink-0 ml-2 relative" ref={groupActionsRef}>
            <button
              onClick={() => setIsGroupActionsOpen(!isGroupActionsOpen)}
              className={`whitespace-nowrap px-4 py-2 rounded-md text-sm border transition-colors flex items-center gap-2 
                        ${selectedArchives.size > 0
                  ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}
                    `}
            >
              Actions groupées {selectedArchives.size > 0 && `(${selectedArchives.size})`}
              <ChevronDownIcon className="w-4 h-4" />
            </button>

            {isGroupActionsOpen && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-100 shadow-xl rounded-xl z-50 flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                <div className="px-4 py-2 text-xs font-bold text-gray-500 text-left border-b border-gray-50 mb-1">
                  {selectedArchives.size === 0 ? 'Aucun élément sélectionné' : `Actions pour ${selectedArchives.size} éléments`}
                </div>

                {selectedArchives.size > 0 ? (
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
                    <button onClick={handleGroupUnarchive} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors text-left w-full">
                      <ArchiveBoxIcon className="w-4 h-4" />
                      Désarchiver
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

        {/* Table */}
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Chargement des archives...</div>
          ) : (
            <DataTable
              columns={columns}
              data={paginatedArchives}
              headerCheckbox={headerCheckbox}
              pagination={{
                currentPage,
                totalPages: Math.ceil(filteredArchives.length / ITEMS_PER_PAGE),
                totalItems: filteredArchives.length,
                onPageChange: setCurrentPage
              }}
            />
          )}
        </div>

      </div>
    </RoleProtectedPage>
  )
}
