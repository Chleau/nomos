'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { useQuery } from '@tanstack/react-query'
import { arretesService } from '@/lib/services/arretes.service'
import Button from '@/components/ui/Button'
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown'
import Pagination from '@/components/ui/Pagination'
import {
    MagnifyingGlassIcon,
    AdjustmentsVerticalIcon,
    BarsArrowDownIcon,
    ArrowLeftIcon,
    EyeIcon
} from '@heroicons/react/24/outline'
import { BiImport } from 'react-icons/bi'

// Hook specific to this page
function useImportHistory(communeId: number | null) {
    return useQuery({
        queryKey: ['arretes', 'imports-history', communeId],
        queryFn: async () => {
            const { data, error } = await arretesService.getImportHistory(communeId)
            if (error) throw error
            return data
        },
        enabled: !!communeId
    })
}

export default function HistoriqueImportsPage() {
    const router = useRouter()
    const { user } = useSupabaseAuth()
    const { data: habitant } = useCurrentHabitant(user?.id || null)
    const { data: imports, isLoading } = useImportHistory(habitant?.commune_id || null)

    const [searchTerm, setSearchTerm] = useState('')
    const [filterState, setFilterState] = useState<FilterState | null>(null)
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [sortOrder, setSortOrder] = useState<'recent' | 'ancien'>('recent')
    const [currentPage, setCurrentPage] = useState(1)
    const ITEMS_PER_PAGE = 10

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filterState, sortOrder])

    // Filter imports based on search
    const filteredImports = useMemo(() => {
        if (!imports) return []
        let filtered = [...imports]

        // 1. Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            filtered = filtered.filter(imp =>
                imp.titre.toLowerCase().includes(lower) ||
                (imp.agent?.nom && imp.agent.nom.toLowerCase().includes(lower)) ||
                (imp.agent?.prenom && imp.agent.prenom.toLowerCase().includes(lower))
            )
        }

        // 2. Date Filter
        if (filterState) {
            if (filterState.startDate || filterState.endDate) {
                filtered = filtered.filter(imp => {
                    const d = new Date(imp.date_creation)
                    if (filterState.startDate) {
                        const start = new Date(filterState.startDate)
                        if (d < start) return false
                    }
                    if (filterState.endDate) {
                        const end = new Date(filterState.endDate)
                        end.setHours(23, 59, 59, 999)
                        if (d > end) return false
                    }
                    return true
                })
            }
        }

        // 3. Sort
        filtered.sort((a, b) => {
            const dA = new Date(a.date_creation).getTime()
            const dB = new Date(b.date_creation).getTime()
            return sortOrder === 'recent' ? dB - dA : dA - dB
        })

        return filtered
    }, [imports, searchTerm, filterState, sortOrder])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).replace('.', '')
    }

    const getInitials = (agent: { nom: string, prenom: string } | null) => {
        if (!agent) return '??'
        return `${agent.prenom[0]}${agent.nom[0]}`.toUpperCase()
    }

    const paginatedImports = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredImports.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredImports, currentPage])

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

                {/* Header Section */}
                <div className="flex justify-between items-center">
                    <h1 className="text-[36px] font-semibold text-[#242a35] font-['Poppins']">
                        Historique des imports
                    </h1>
                    <span className="text-sm text-[#16a34a] bg-green-50 px-3 py-1 rounded-md border border-green-200">
                        Dernière mise à jour le {new Date().toLocaleDateString('fr-FR')}
                    </span>
                </div>

                {/* Action Bar */}
                <div className="flex justify-end items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#e67e22] focus:border-[#e67e22] w-[150px] h-[32px]"
                        />
                    </div>

                    {/* Filters Button */}
                    <div className="relative">
                        <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        >
                            <AdjustmentsVerticalIcon className="w-5 h-5" />
                            Filtres
                        </Button>
                        <FilterDropdown
                            isOpen={showFilterDropdown}
                            onClose={() => setShowFilterDropdown(false)}
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

                    {/* Sort Button */}
                    <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSortOrder(sortOrder === 'recent' ? 'ancien' : 'recent')}
                    >
                        <BarsArrowDownIcon className={`w-5 h-5 transition-transform ${sortOrder === 'ancien' ? 'rotate-180' : ''}`} />
                        {sortOrder === 'recent' ? 'trier par : le plus récent' : 'trier par : le plus ancien'}
                    </Button>

                    {/* Import Button */}
                    <Button
                        size="xs"
                        variant="primary"
                        onClick={() => router.push('/mairie/archives/importer')}
                        className="flex items-center gap-2 text-white font-medium"
                    >
                        <BiImport className="text-xl" />
                        Importer des archives
                    </Button>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 bg-slate-100 text-slate-500 font-medium text-sm py-4 px-6 border-b border-slate-200">
                        <div className="col-span-4">Titre</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-3">Agent responsable</div>
                        <div className="col-span-2">Collectivité</div>
                        <div className="col-span-1 text-center">Action</div>
                    </div>

                    {/* Table Body */}
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Chargement de l&apos;historique...</div>
                    ) : filteredImports.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Aucun historique d&apos;import trouvé.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {paginatedImports.map((imp: any) => (
                                <div key={imp.id} className="grid grid-cols-12 items-center py-4 px-6 hover:bg-slate-50 transition-colors">
                                    <div className="col-span-4 font-medium text-[#242a35] truncate pr-4" title={imp.titre}>
                                        {imp.titre}
                                    </div>
                                    <div className="col-span-2 text-slate-500 text-sm">
                                        {formatDate(imp.date_creation)}
                                    </div>
                                    <div className="col-span-3 flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border
                                            ${imp.agent ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-500 border-slate-200'}
                                        `}>
                                            {getInitials(imp.agent)}
                                        </div>
                                        <div className="text-sm text-[#242a35] font-medium">
                                            {imp.agent ? `${imp.agent.prenom} ${imp.agent.nom}` : 'Inconnu'}
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-sm text-slate-600">
                                        {imp.commune?.nom || 'Commune'}
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button
                                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                                            onClick={() => router.push(`/mairie/archives/historique/${encodeURIComponent(imp.titre)}`)}
                                            title="Voir les fichiers"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredImports.length / ITEMS_PER_PAGE)}
                    onPageChange={setCurrentPage}
                    itemCount={paginatedImports.length}
                    totalItems={filteredImports.length}
                />
            </div>
        </RoleProtectedPage>
    )
}
