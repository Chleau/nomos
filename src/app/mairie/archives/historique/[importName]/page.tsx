'use client'

import React, { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { useQuery } from '@tanstack/react-query'
import { arretesService } from '@/lib/services/arretes.service'
import { useDeleteArrete, useUpdateArrete } from '@/lib/hooks/useArretes'
import { ARRETE_CATEGORIES, CATEGORY_COLORS } from '@/lib/constants'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown'
import { DataTable, Column, TableBadge } from '@/components/ui/Table'
import {
    ArrowLeftIcon,
    PencilIcon,
    EyeIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    TrashIcon,
    ArchiveBoxIcon,
    StarIcon,
    AdjustmentsVerticalIcon,
    BarsArrowDownIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { FiMapPin } from 'react-icons/fi'

// --- Interface ---
interface ArchiveRow {
    id: number | string
    titre: string
    reference: string
    categorie: string
    date: string
    statut: string
    favori: boolean
    rawDate: Date
    auteur: string
    collectivite: string
    agent?: { nom: string }
}

// --- Helpers ---
const getCategoryColor = (categorie: string): 'neutral' | 'warning' | 'error' | 'success' | 'info' | 'purple' | 'orange' | 'blue' | 'pink' | 'indigo' | 'teal' => {
    return (CATEGORY_COLORS[categorie] as any) || 'neutral'
}

function useImportDocuments(importName: string, communeId: number | null) {
    return useQuery({
        queryKey: ['arretes', 'import-documents', importName, communeId],
        queryFn: async () => {
            const decodedName = decodeURIComponent(importName)
            const { data, error } = await arretesService.getByImportName(decodedName, communeId)
            if (error) throw error
            return data
        },
        enabled: !!communeId && !!importName
    })
}


export default function ImportDetailsPage() {
    const router = useRouter()
    const params = useParams()
    const importName = params.importName as string
    const decodedImportName = decodeURIComponent(importName)

    const { user } = useSupabaseAuth()
    const { data: habitant } = useCurrentHabitant(user?.id || null)

    // Mutations
    const deleteArrete = useDeleteArrete()
    const updateArrete = useUpdateArrete()

    // --- Data Fetching ---
    const { data: arretes, isLoading } = useImportDocuments(importName, habitant?.commune_id || null)

    // --- State ---
    const [selectedArchives, setSelectedArchives] = useState<Set<string | number>>(new Set())
    const [searchTerm, setSearchTerm] = useState('')
    const [favorites, setFavorites] = useState<Set<number>>(new Set())
    const [filterState, setFilterState] = useState<FilterState | null>(null)
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [activeCategory, setActiveCategory] = useState<string | null>(null)
    const [sortOrder, setSortOrder] = useState<'recent' | 'ancien'>('recent')
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    // Group Actions State
    const [isGroupActionsOpen, setIsGroupActionsOpen] = useState(false)
    const groupActionsRef = React.useRef<HTMLDivElement>(null)

    // Close group actions on click outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (groupActionsRef.current && !groupActionsRef.current.contains(event.target as Node)) {
                setIsGroupActionsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // --- Handlers ---
    const toggleFavorite = (id: number) => {
        const newFavorites = new Set(favorites)
        if (newFavorites.has(id)) newFavorites.delete(id)
        else newFavorites.add(id)
        setFavorites(newFavorites)
    }

    const handleSelectRow = (id: string | number) => {
        const newSelected = new Set(selectedArchives)
        if (newSelected.has(id)) newSelected.delete(id)
        else newSelected.add(id)
        setSelectedArchives(newSelected)
    }

    const handleSelectAll = () => {
        if (!documents) return
        if (selectedArchives.size === documents.length) {
            setSelectedArchives(new Set())
        } else {
            setSelectedArchives(new Set(documents.map(d => d.id)))
        }
    }

    // --- Data Filtering/Transformation ---
    const documents: ArchiveRow[] = useMemo(() => {
        if (!arretes) return []

        let filtered = arretes.map(a => {
            const date = new Date(a.date_creation)
            return {
                id: a.id,
                titre: a.titre,
                reference: a.numero || '-', // Placeholder
                categorie: a.categorie || 'Sans catégorie',
                date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
                rawDate: date,
                statut: a.statut || 'Archivé',
                favori: favorites.has(a.id),
                agent: a.agents_mairie,
                auteur: 'Maire', // Mock/Default since DB might not have explicit author string
                collectivite: a.communes?.nom || habitant?.commune?.nom || 'Ma Ville'
            }
        })

        // Filter: Search Term
        if (searchTerm) {
            const lowerInfo = searchTerm.toLowerCase()
            filtered = filtered.filter(d =>
                d.titre.toLowerCase().includes(lowerInfo) ||
                d.reference.toLowerCase().includes(lowerInfo)
            )
        }

        // Filter: Category Chip
        if (activeCategory) {
            if (activeCategory === 'Mes favoris') {
                filtered = filtered.filter(r => r.favori)
            } else {
                filtered = filtered.filter(r => r.categorie === activeCategory)
            }
        }

        // Filter: Dropdown
        if (filterState) {
            // Dates
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
            // Themes
            if (filterState.themes && filterState.themes.length > 0) {
                filtered = filtered.filter(r => filterState.themes!.includes(r.categorie))
            }
        }

        // Sorting
        filtered.sort((a, b) => {
            if (sortOrder === 'recent') {
                return b.rawDate.getTime() - a.rawDate.getTime()
            } else {
                return a.rawDate.getTime() - b.rawDate.getTime()
            }
        })

        return filtered
    }, [arretes, favorites, searchTerm, habitant, activeCategory, filterState, sortOrder])

    // Reset pagination on filter change
    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filterState, sortOrder, activeCategory])

    const paginatedDocuments = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return documents.slice(start, start + ITEMS_PER_PAGE)
    }, [documents, currentPage])

    // --- Group Action Handlers ---
    const handleGroupView = () => {
        const ids = Array.from(selectedArchives)
        let blockedCount = 0

        ids.forEach((id) => {
            const w = window.open(`/mairie/archives/${id}?mode=view`, '_blank')
            if (!w) blockedCount++
        })

        if (blockedCount > 0) {
            alert(`Attention : ${blockedCount} onglet(s) bloqué(s) par le navigateur.`)
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
            alert(`Attention : ${blockedCount} onglet(s) bloqué(s) par le navigateur.`)
        }
        setIsGroupActionsOpen(false)
    }

    const handleGroupDownload = () => {
        selectedArchives.forEach(id => {
            const arrete = (arretes || []).find(a => a.id === id)
            if (arrete) {
                // Check for file url or content
                if (arrete.fichier_url) {
                    const link = document.createElement('a');
                    link.href = arrete.fichier_url;
                    link.download = arrete.titre || 'document';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else if (arrete.contenu) {
                    const element = document.createElement("a");
                    const file = new Blob([arrete.contenu], { type: 'text/plain' });
                    element.href = URL.createObjectURL(file);
                    element.download = `${arrete.titre || 'document'}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }
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
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedArchives.size} documents ?`)) {
            console.log(`Deleting ${selectedArchives.size} items...`)
            const promises = Array.from(selectedArchives).map(id => deleteArrete.mutateAsync(id as number))
            await Promise.all(promises)
            setSelectedArchives(new Set())
        }
        setIsGroupActionsOpen(false)
    }

    const handleGroupArchive = async () => {
        if (confirm(`Êtes-vous sûr de vouloir archiver ${selectedArchives.size} documents ?`)) {
            const promises = Array.from(selectedArchives).map(id =>
                updateArrete.mutateAsync({ id: id as number, updates: { archive: true, statut: 'Archivé' } })
            )
            await Promise.all(promises)
            setSelectedArchives(new Set())
        }
        setIsGroupActionsOpen(false)
    }

    // --- Columns Definition ---
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
                    {row.favori ? <StarIcon className="w-5 h-5 fill-current" /> : <StarIcon className="w-5 h-5" />}
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
                    <span>{row.collectivite}</span>
                </div>
            )
        },
        {
            header: 'Action',
            align: 'center',
            width: '10%',
            render: (row) => (
                <div className="flex items-center justify-center gap-2">
                    <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors" title="Consulter" onClick={() => router.push(`/mairie/archives/${row.id}?mode=view`)}>
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors" title="Modifier" onClick={() => router.push(`/mairie/archives/${row.id}?mode=edit`)}>
                        <PencilIcon className="w-5 h-5" />
                    </button>
                </div>
            )
        }
    ]

    const headerCheckbox = (
        <Checkbox
            checked={documents.length > 0 && selectedArchives.size === documents.length}
            state={selectedArchives.size > 0 && selectedArchives.size < documents.length ? 'indeterminate' : undefined}
            onChange={handleSelectAll}
        />
    )

    return (
        <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
            <div className="p-12 w-full max-w-[1600px] mx-auto space-y-8">

                {/* Back Button */}
                <div>
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-[#242a35] border-[#e2e8f0] hover:bg-slate-50"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        retour
                    </Button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col gap-6">
                    <h1 className="text-[32px] font-bold text-[#242a35] font-['Montserrat']">
                        {decodedImportName}
                    </h1>

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
                            ${selectedArchives.size > 0
                                        ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
                                        : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}
                        `}
                            >
                                Action groupées {selectedArchives.size > 0 && `(${selectedArchives.size})`}
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

                {/* Table */}
                <div className="mt-4">
                    {isLoading ? (
                        <div className="p-12 text-center text-slate-500">Chargement des documents...</div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={paginatedDocuments}
                            headerCheckbox={headerCheckbox}
                            pagination={{
                                currentPage,
                                totalPages: Math.ceil(documents.length / ITEMS_PER_PAGE),
                                totalItems: documents.length,
                                onPageChange: setCurrentPage
                            }}
                        />
                    )}
                </div>

            </div>
        </RoleProtectedPage>
    )
}

