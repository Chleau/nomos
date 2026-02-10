'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableBadge
} from '@/components/ui/Table'
import {
  FiSearch,
  FiFilter,
  FiClock,
  FiStar,
  FiMoreVertical,
  FiEye,
  FiEdit2,
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
  PaperAirplaneIcon,
  StarIcon,
  AdjustmentsVerticalIcon,
  BarsArrowDownIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { HiSortDescending } from 'react-icons/hi'
import { BiImport } from 'react-icons/bi'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { useArretes } from '@/lib/hooks/useArretes'
import { ARRETE_CATEGORIES } from '@/lib/constants'

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
}

const CATEGORY_COLORS_MAP: Record<string, 'warning' | 'purple' | 'success' | 'orange' | 'error' | 'info' | 'neutral'> = {
  'Sécurité publique': 'warning',
  'Environnement': 'purple',
  'Santé publique': 'success',
  'Commerce': 'orange',
  'Transport': 'error',
  'Fonction publique': 'info',
  'Sans catégorie': 'neutral',
  'Panneau cassé': 'orange'
}

export default function ArchivesPage() {
  const router = useRouter()
  const { user } = useSupabaseAuth()
  const { data: habitant } = useCurrentHabitant(user?.id || null)
  const { data: arretes, isLoading } = useArretes(habitant?.commune_id || null)

  // States
  const [selectedArchives, setSelectedArchives] = useState<Set<string | number>>(new Set())
  const [filterState, setFilterState] = useState<FilterState | null>(null)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'recent' | 'ancien'>('recent')
  const [searchTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useState<Set<number>>(new Set())

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
          agent: arrete.agent
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

  return (
    <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
      <div className="p-8 w-full max-w-[1600px] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-[32px] font-bold text-[#242a35]">Toutes les archives</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200">
              Dernière mise à jour le {new Date().toLocaleDateString()}
            </span>
            <Button variant="outline" className="flex items-center gap-2 text-slate-600 border-slate-300">
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
            className="items-center gap-2 bg-[#e67e22] hover:bg-[#d35400] text-white border-none shadow-sm"
            onClick={() => router.push('/mairie/archives/importer')}
          >
            <BiImport className="text-lg" />
            Importer des archives
          </Button>
        </div>

        {/* Categories / Tags */}
        <div className="flex items-center gap-2 w-full">
          <div className="flex gap-2 overflow-x-auto items-center flex-1 no-scrollbar pb-2">
            <button
              onClick={() => setActiveCategory(activeCategory === 'Mes favoris' ? null : 'Mes favoris')}
              className={`
                whitespace-nowrap px-4 py-2 rounded-md text-sm border transition-colors flex items-center gap-2
                ${activeCategory === 'Mes favoris'
                  ? 'bg-[#e67e22] text-[#242a35] border-[#e67e22] hover:bg-[#d35400] hover:text-white font-medium'
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
                    ? 'bg-[#e67e22] text-[#242a35] border-[#e67e22] hover:bg-[#d35400] hover:text-white font-medium'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                `}
              >
                {activeCategory === cat && <XMarkIcon className="w-4 h-4" />}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-md shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Chargement des archives...</div>
          ) : filteredArchives.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Aucune archive trouvée pour ces critères</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f1f5f9] hover:bg-[#f1f5f9]">
                  <TableHead className="w-[50px]">
                    <div className="flex justify-center">
                      <Checkbox
                        checked={selectedArchives.size === filteredArchives.length && filteredArchives.length > 0}
                        onChange={handleSelectAll}
                      />
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]">Favoris</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Numéro officiel</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Collectivité</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArchives.map((arrete) => (
                  <TableRow key={arrete.id}>
                    <TableCell>
                      <div className="flex justify-center">
                        <Checkbox
                          checked={selectedArchives.has(arrete.id)}
                          onChange={() => handleSelectRow(arrete.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center" onClick={() => toggleFavorite(arrete.id as number)}>
                        {arrete.favori ? (
                          <FiStar className="text-[#fbbf24] fill-[#fbbf24] text-lg cursor-pointer transition-transform hover:scale-110" />
                        ) : (
                          <FiStar className="text-slate-300 text-lg cursor-pointer hover:text-[#fbbf24] transition-colors" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-[#334155]">
                      {arrete.titre || 'Sans titre'}
                    </TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap">
                      {arrete.date}
                    </TableCell>
                    <TableCell className="text-slate-500 text-center">
                      {arrete.reference || '-'}
                    </TableCell>
                    <TableCell className="font-medium text-slate-700">
                      {arrete.agent?.nom || 'Maire'}
                    </TableCell>
                    <TableCell>
                      <TableBadge
                        label={arrete.categorie || 'Sans catégorie'}
                        color={CATEGORY_COLORS_MAP[arrete.categorie || 'Sans catégorie'] || 'neutral'}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-slate-600">
                        <FiMapPin />
                        <span>{habitant?.commune?.nom || 'Commune'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3">
                        <button className="text-slate-400 hover:text-slate-600 transition-colors">
                          <FiMoreVertical size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/mairie/archives/${arrete.id}?mode=view`)}
                          className="text-slate-400 hover:text-blue-500 transition-colors"
                          title="Consulter"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/mairie/archives/${arrete.id}?mode=edit`)}
                          className="text-slate-400 hover:text-orange-500 transition-colors"
                          title="Modifier"
                        >
                          <FiEdit2 size={18} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

      </div>
    </RoleProtectedPage>
  )
}
