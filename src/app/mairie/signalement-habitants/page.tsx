'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import { useAllSignalements } from '@/lib/hooks/useSignalements'
import { DataTable, Column, TableUserInfo, TableBadge, TableStatus } from '@/components/ui/Table'
import { EyeIcon, PencilIcon, MapPinIcon, StarIcon, ChevronDownIcon, MagnifyingGlassIcon, AdjustmentsVerticalIcon, BarsArrowDownIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import type { Signalement } from '@/types/signalements'
import Button from '@/components/ui/Button'
import FilterDropdown, { FilterState } from '@/components/ui/FilterDropdown'

// Icônes SVG pour les catégories
const RouteBarreeIcon = () => (
  <svg width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M7.73625 17.5355C7.30646 17.5355 6.94114 17.514 6.64028 17.471C6.33943 17.4281 6.189 17.2776 6.189 17.0198C6.189 16.7275 6.33943 16.4825 6.64028 16.2848C6.94114 16.0871 7.30646 15.9882 7.73625 15.9882C8.16604 15.9882 8.53136 16.0871 8.83222 16.2848C9.13307 16.4825 9.2835 16.7275 9.2835 17.0198C9.2835 17.2776 9.13307 17.4281 8.83222 17.471C8.53136 17.514 8.16604 17.5355 7.73625 17.5355ZM15.9882 19.5985C15.5585 19.5985 15.1931 19.577 14.8923 19.534C14.5914 19.4911 14.441 19.3406 14.441 19.0828C14.441 18.7905 14.5914 18.5455 14.8923 18.3478C15.1931 18.1501 15.5585 18.0513 15.9882 18.0513C16.418 18.0513 16.7834 18.1501 17.0842 18.3478C17.3851 18.5455 17.5355 18.7905 17.5355 19.0828C17.5355 19.3406 17.3851 19.4911 17.0842 19.534C16.7834 19.577 16.418 19.5985 15.9882 19.5985ZM10.8307 19.5985C10.401 19.5985 10.0356 19.577 9.73478 19.534C9.43393 19.4911 9.2835 19.3406 9.2835 19.0828C9.2835 18.7905 9.43393 18.5455 9.73478 18.3478C10.0356 18.1501 10.401 18.0513 10.8307 18.0513C11.2605 18.0513 11.6259 18.1501 11.9267 18.3478C12.2276 18.5455 12.378 18.7905 12.378 19.0828C12.378 19.3406 12.2276 19.4911 11.9267 19.534C11.6259 19.577 11.2605 19.5985 10.8307 19.5985ZM2.57875 19.5985C2.14896 19.5985 1.78364 19.577 1.48278 19.534C1.18193 19.4911 1.0315 19.3406 1.0315 19.0828C1.0315 18.7905 1.18193 18.5455 1.48278 18.3478C1.78364 18.1501 2.14896 18.0513 2.57875 18.0513C3.00854 18.0513 3.37386 18.1501 3.67472 18.3478C3.97557 18.5455 4.126 18.7905 4.126 19.0828C4.126 19.3406 3.97557 19.4911 3.67472 19.534C3.37386 19.577 3.00854 19.5985 2.57875 19.5985ZM6.70475 20.63C6.27496 20.63 5.90964 20.6085 5.60878 20.5655C5.30793 20.5226 5.1575 20.3721 5.1575 20.1143C5.1575 19.822 5.30793 19.577 5.60878 19.3793C5.90964 19.1816 6.27496 19.0828 6.70475 19.0828C7.13454 19.0828 7.49986 19.1816 7.80072 19.3793C8.10157 19.577 8.252 19.822 8.252 20.1143C8.252 20.3721 8.10157 20.5226 7.80072 20.5655C7.49986 20.6085 7.13454 20.63 6.70475 20.63ZM3.0945 14.441V15.4725C3.0945 15.7648 2.99565 16.0097 2.79794 16.2074C2.60024 16.4051 2.35526 16.504 2.063 16.504H1.0315C0.739242 16.504 0.49426 16.4051 0.296556 16.2074C0.0988521 16.0097 0 15.7648 0 15.4725V7.2205L2.16615 1.0315C2.2693 0.72205 2.45411 0.472771 2.72058 0.283662C2.98705 0.0945542 3.28361 0 3.61025 0H14.9567C15.2834 0 15.5799 0.0945542 15.8464 0.283662C16.1129 0.472771 16.2977 0.72205 16.4009 1.0315L18.567 7.2205V15.4725C18.567 15.7648 18.4681 16.0097 18.2704 16.2074C18.0727 16.4051 17.8278 16.504 17.5355 16.504H16.504C16.2117 16.504 15.9668 16.4051 15.7691 16.2074C15.5714 16.0097 15.4725 15.7648 15.4725 15.4725V14.441H3.0945ZM2.8882 5.1575H15.6788L14.5957 2.063H3.97128L2.8882 5.1575ZM4.64175 11.3465C5.07154 11.3465 5.43686 11.1961 5.73772 10.8952C6.03857 10.5944 6.189 10.229 6.189 9.79925C6.189 9.36946 6.03857 9.00414 5.73772 8.70328C5.43686 8.40243 5.07154 8.252 4.64175 8.252C4.21196 8.252 3.84664 8.40243 3.54578 8.70328C3.24493 9.00414 3.0945 9.36946 3.0945 9.79925C3.0945 10.229 3.24493 10.5944 3.54578 10.8952C3.84664 11.1961 4.21196 11.3465 4.64175 11.3465ZM13.9253 11.3465C14.355 11.3465 14.7204 11.1961 15.0212 10.8952C15.3221 10.5944 15.4725 10.229 15.4725 9.79925C15.4725 9.36946 15.3221 9.00414 15.0212 8.70328C14.7204 8.40243 14.355 8.252 13.9253 8.252C13.4955 8.252 13.1301 8.40243 12.8293 8.70328C12.5284 9.00414 12.378 9.36946 12.378 9.79925C12.378 10.229 12.5284 10.5944 12.8293 10.8952C13.1301 11.1961 13.4955 11.3465 13.9253 11.3465Z" fill="#053F5C" />
  </svg>
)

const InondationIcon = () => (
  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M10.6026 20.0048C10.0524 20.0048 9.58149 19.809 9.18973 19.4172C8.79797 19.0254 8.60209 18.5545 8.60209 18.0044H12.6031C12.6031 18.5545 12.4072 19.0254 12.0154 19.4172C11.6237 19.809 11.1527 20.0048 10.6026 20.0048ZM16.0539 12.6031L5.45132 2.0505C6.13482 1.41701 6.91418 0.916889 7.78939 0.550133C8.6646 0.183378 9.60233 0 10.6026 0C12.6864 0 14.4577 0.729343 15.9164 2.18803C17.375 3.64672 18.1044 5.41798 18.1044 7.50182C18.1044 8.68544 17.896 9.69818 17.4792 10.5401C17.0625 11.3819 16.5874 12.0696 16.0539 12.6031ZM19.8048 19.2047L18.3795 20.63L11.7528 14.0034H6.85166C5.70138 13.3199 4.78866 12.403 4.1135 11.2527C3.43833 10.1024 3.10075 8.85215 3.10075 7.50182C3.10075 7.1684 3.12159 6.84332 3.16327 6.52658C3.20494 6.20984 3.26746 5.90143 3.35081 5.60136L0 2.20053L1.40034 0.800194L19.8048 19.2047ZM14.7536 15.0036V17.0041H6.6016V15.0036H14.7536Z" fill="#053F5C" />
  </svg>
)

const ChausseeAbimeeIcon = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M9.2835 20.63V7.2205H0L10.315 0L20.63 7.2205H11.3465V20.63H9.2835ZM1.0315 20.63V15.2146L0.2063 10.676L2.21773 10.315L2.99135 14.441H7.2205V20.63H5.1575V16.504H3.0945V20.63H1.0315ZM13.4095 20.63V14.441H17.6387L18.4123 10.315L20.4237 10.676L19.5985 15.2146V20.63H17.5355V16.504H15.4725V20.63H13.4095Z" fill="#053F5C" />
  </svg>
)

const DetritusIcon = () => (
  <svg width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M3.43833 20.63C2.80797 20.63 2.26834 20.4056 1.81945 19.9567C1.37056 19.5078 1.14611 18.9681 1.14611 18.3378V3.43833H0V1.14611H5.73056V0H12.6072V1.14611H18.3378V3.43833H17.1917V18.3378C17.1917 18.9681 16.9672 19.5078 16.5183 19.9567C16.0694 20.4056 15.5298 20.63 14.8994 20.63H3.43833ZM5.73056 16.0456H8.02278V5.73056H5.73056V16.0456ZM10.315 16.0456H12.6072V5.73056H10.315V16.0456Z" fill="#053F5C" />
  </svg>
)

const PanneauCasseIcon = () => (
  <svg width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M11.2148 20.63H7.2205V16.504H0L4.09674 10.315H2.04837L9.21766 0L16.3869 10.315H14.3386L18.4353 16.504H11.2148V20.63Z" fill="#053F5C" />
  </svg>
)

const MobilierAbimeIcon = () => (
  <svg width="19" height="21" viewBox="0 0 19 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M8.252 20.63V16.504H3.0945L0 13.4095L3.0945 10.315H8.252V8.252H1.0315V2.063H8.252V0H10.315V2.063H15.4725L18.567 5.1575L15.4725 8.252H10.315V10.315H17.5355V16.504H10.315V20.63H8.252Z" fill="#053F5C" />
  </svg>
)

const EclairagePublicIcon = () => (
  <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
    <path d="M8.766 20.63V18.567H12.201V20.63H8.766ZM8.766 16.504V14.441H12.201V16.504H8.766ZM7.73344 12.378C6.53262 11.6601 5.56839 10.6874 4.84075 9.45997C4.11311 8.23252 3.74929 6.88526 3.74929 5.41819C3.74929 3.81707 4.30896 2.45271 5.4283 1.32511C6.54764 0.197504 7.90912 -0.366272 9.51274 -0.366272C11.1164 -0.366272 12.4778 0.197504 13.5972 1.32511C14.7165 2.45271 15.2762 3.81707 15.2762 5.41819C15.2762 6.88526 14.9124 8.23252 14.1847 9.45997C13.4571 10.6874 12.4929 11.6601 11.292 12.378H7.73344ZM8.40645 10.315H12.6187C13.4236 9.81815 14.0639 9.16487 14.5394 8.35515C15.0149 7.54544 15.2527 6.64118 15.2527 5.64238C15.2527 4.41493 14.8179 3.36774 13.9484 2.50081C13.0788 1.63387 12.0293 1.20041 10.7999 1.20041C9.57048 1.20041 8.52097 1.63387 7.65135 2.50081C6.78173 3.36774 6.34693 4.41493 6.34693 5.64238C6.34693 6.64118 6.58469 7.54544 7.06022 8.35515C7.53575 9.16487 8.17606 9.81815 8.98114 10.315H8.40645Z" fill="#053F5C" />
  </svg>
)

// Définir les catégories de filtres avec leurs icônes
const filterCategories = [
  { id: 'favoris', label: 'Mes favoris', icon: <StarIcon className="w-5 h-5" /> },
  { id: 'Route barrée', label: 'Route barrée', icon: <RouteBarreeIcon /> },
  { id: 'Inondations', label: 'Inondations', icon: <InondationIcon /> },
  { id: 'Chaussée abîmée', label: 'Chaussée abîmée', icon: <ChausseeAbimeeIcon /> },
  { id: 'Détritus', label: 'Détritus', icon: <DetritusIcon /> },
  { id: 'Panneau cassé', label: 'Panneau cassé', icon: <PanneauCasseIcon /> },
  { id: 'Mobilier abîmé', label: 'Mobilier abîmé', icon: <MobilierAbimeIcon /> },
  { id: 'Éclairage public', label: 'Éclairage public', icon: <EclairagePublicIcon /> }
]

export default function SignalementHabitantsPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [filterState, setFilterState] = useState<FilterState | null>(null)
  const [sortOrder, setSortOrder] = useState<'recent' | 'ancien'>('recent')
  const itemsPerPage = 10

  const { data: allSignalements = [], isLoading } = useAllSignalements()

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, activeFilter, filterState, sortOrder])

  // Fonction de filtrage complète
  const getFilteredSignalements = () => {
    if (!allSignalements) return []
    let filtered = [...allSignalements]

    // Recherche textuelle
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      filtered = filtered.filter(s =>
        s.titre?.toLowerCase().includes(lowerTerm) ||
        s.description?.toLowerCase().includes(lowerTerm) ||
        s.nom?.toLowerCase().includes(lowerTerm) ||
        s.prenom?.toLowerCase().includes(lowerTerm) ||
        s.habitants?.nom?.toLowerCase().includes(lowerTerm) ||
        s.habitants?.prenom?.toLowerCase().includes(lowerTerm)
      )
    }

    // Filtre par catégorie (barre horizontale)
    if (activeFilter) {
      if (activeFilter === 'favoris') {
        filtered = filtered.filter(s => favoriteIds.has(s.id))
      } else {
        filtered = filtered.filter(s => s.types_signalement?.libelle === activeFilter)
      }
    }

    // Filtre avancé (dropdown)
    if (filterState) {
      // Filtre par dates
      if (filterState.startDate || filterState.endDate) {
        filtered = filtered.filter(s => {
          const sDate = new Date(s.date_signalement || s.created_at || '')
          if (filterState.startDate) {
            const startDate = new Date(filterState.startDate)
            if (sDate < startDate) return false
          }
          if (filterState.endDate) {
            const endDate = new Date(filterState.endDate)
            endDate.setHours(23, 59, 59, 999)
            if (sDate > endDate) return false
          }
          return true
        })
      }

      // Filtre par thèmes (catégories via dropdown)
      if (filterState.themes && filterState.themes.length > 0) {
        filtered = filtered.filter(s =>
          filterState.themes.includes(s.types_signalement?.libelle || '')
        )
      }
    }

    // Tri
    filtered.sort((a, b) => {
      const dateA = new Date(a.date_signalement || a.created_at || 0)
      const dateB = new Date(b.date_signalement || b.created_at || 0)
      if (sortOrder === 'recent') {
        return dateB.getTime() - dateA.getTime()
      } else {
        return dateA.getTime() - dateB.getTime()
      }
    })

    return filtered
  }

  const filteredSignalements = getFilteredSignalements()

  // Pagination
  const totalItems = filteredSignalements.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredSignalements.slice(startIndex, startIndex + itemsPerPage)

  // Fonction pour obtenir les initiales
  const getInitials = (nom?: string, prenom?: string) => {
    const n = nom?.charAt(0)?.toUpperCase() || ''
    const p = prenom?.charAt(0)?.toUpperCase() || ''
    return `${p}${n}` || 'AN'
  }

  // Fonction pour formater la date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // Fonction pour obtenir la couleur du badge selon la catégorie
  const getCategoryColor = (libelle?: string): 'warning' | 'error' | 'success' | 'info' | 'purple' | 'orange' | 'neutral' => {
    if (!libelle) return 'neutral'
    const lower = libelle.toLowerCase()
    if (lower.includes('urgent') || lower.includes('danger')) return 'error'
    if (lower.includes('voirie') || lower.includes('route')) return 'warning'
    if (lower.includes('éclairage') || lower.includes('eclairage')) return 'orange'
    if (lower.includes('propreté') || lower.includes('proprete')) return 'info'
    if (lower.includes('espace')) return 'success'
    return 'purple'
  }

  // Définir les colonnes
  const columns: Column<Signalement>[] = [
    {
      header: '',
      width: '50px',
      align: 'center',
      render: (item) => (
        <input
          type="checkbox"
          checked={selectedIds.has(item.id)}
          onChange={() => {
            const newSet = new Set(selectedIds)
            if (newSet.has(item.id)) {
              newSet.delete(item.id)
            } else {
              newSet.add(item.id)
            }
            setSelectedIds(newSet)
          }}
          className="w-4 h-4 rounded border-gray-300 text-[#f27f09] focus:ring-[#f27f09]"
        />
      )
    },
    {
      header: 'Habitant',
      width: '200px',
      render: (item) => (
        <TableUserInfo
          initials={getInitials(item.nom || item.habitants?.nom, item.prenom || item.habitants?.prenom)}
          name={`${item.prenom || item.habitants?.prenom || ''} ${item.nom || item.habitants?.nom || 'Anonyme'}`.trim()}
          subText={`ID: ${item.habitant_id || 'N/A'}`}
        />
      )
    },
    {
      header: 'Date',
      width: '120px',
      render: (item) => (
        <span className="text-[#242a35] text-sm">{formatDate(item.date_signalement || item.created_at)}</span>
      )
    },
    {
      header: 'Lieu',
      width: '180px',
      render: (item) => (
        <div className="flex items-center gap-2">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          <span className="text-[#242a35] text-sm truncate">{item.titre || 'Non spécifié'}</span>
        </div>
      )
    },
    {
      header: 'Catégorie',
      width: '180px',
      align: 'center',
      render: (item) => (
        <TableBadge
          color={getCategoryColor(item.types_signalement?.libelle)}
          label={item.types_signalement?.libelle || 'Sans catégorie'}
        />
      )
    },
    {
      header: 'Statut',
      width: '150px',
      align: 'center',
      render: (item) => (
        <TableStatus status={item.statut || 'En attente'} />
      )
    },
    {
      header: 'Référence',
      width: '100px',
      render: (item) => (
        <span className="text-[#242a35] text-sm font-mono">#{item.id}</span>
      )
    },
    {
      header: 'Action',
      width: '130px',
      align: 'center',
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              const newSet = new Set(favoriteIds)
              if (newSet.has(item.id)) {
                newSet.delete(item.id)
              } else {
                newSet.add(item.id)
              }
              setFavoriteIds(newSet)
            }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title={favoriteIds.has(item.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            {favoriteIds.has(item.id) ? (
              <StarIconSolid className="w-5 h-5 text-[#f27f09]" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
          <button
            onClick={() => router.push(`/signalements/${item.id}`)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voir"
          >
            <EyeIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => router.push(`/signalements/${item.id}`)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Modifier"
          >
            <PencilIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )
    }
  ]

  // Statistiques
  const stats = {
    total: (allSignalements || []).length,
    enCours: (allSignalements || []).filter(s => s.statut?.toLowerCase().includes('cours')).length,
    urgent: (allSignalements || []).filter(s => s.priorite?.toLowerCase().includes('urgent')).length,
    resolus: (allSignalements || []).filter(s => s.statut?.toLowerCase().includes('résolu') || s.statut?.toLowerCase().includes('resolu')).length
  }

  return (
    <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
      <div className="min-h-screen bg-[#f5fcfe] p-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#242a35] mb-2">Tout les signalements</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-[#e7eaed]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Signalements en attente</p>
                  <p className="text-2xl font-bold text-[#242a35]">{stats.total - stats.resolus}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MapPinIcon className="w-6 h-6 text-[#f27f09]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#e7eaed]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Incidents en cours</p>
                  <p className="text-2xl font-bold text-[#242a35]">{stats.enCours}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#e7eaed]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Incident urgent</p>
                  <p className="text-2xl font-bold text-[#242a35]">{stats.urgent}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#e7eaed]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nombre d&apos;incidents résolus</p>
                  <p className="text-2xl font-bold text-[#242a35]">{stats.resolus}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex justify-end gap-3 items-center mb-6">
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
                categories={[...new Set((allSignalements || []).map(s => s.types_signalement?.libelle).filter(Boolean) as string[])]}
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

          {/* Filtres par catégorie */}
          <div className="mb-6 flex items-center gap-2 w-full">
            <div className="flex gap-2 overflow-x-auto items-center flex-1 no-scrollbar">
              {/* Mes favoris - style différent */}
              <Button
                variant="favoris"
                size="xs"
                onClick={() => setActiveFilter(activeFilter === 'favoris' ? null : 'favoris')}
                className={`whitespace-nowrap gap-2 ${activeFilter === 'favoris' ? 'active' : ''}`}
              >
                {activeFilter === 'favoris' ? (
                  <XMarkIcon className="w-4 h-4" />
                ) : null}
                <StarIcon className="w-5 h-5" />
                Mes favoris
                {favoriteIds.size > 0 && (
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-white/30">
                    {favoriteIds.size}
                  </span>
                )}
              </Button>

              {/* Autres catégories */}
              {filterCategories.slice(1).map((category) => {
                const isActive = activeFilter === category.id
                const count = (allSignalements || []).filter(s => s.types_signalement?.libelle === category.id).length

                return (
                  <Button
                    size="xs"
                    variant='outline'
                    key={category.id}
                    onClick={() => setActiveFilter(isActive ? null : category.id)}
                    className={`whitespace-nowrap gap-2 ${isActive ? 'active' : ''}`}
                  >
                    {isActive ? (
                      <XMarkIcon className="w-4 h-4" />
                    ) : (
                      category.icon
                    )}
                    {category.label}
                    {count > 0 && (
                      <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {count}
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>

            {/* Bouton Action groupées */}
            <div className="shrink-0 ml-2 relative">
              <Button
                size="xs"
                variant="outline"
                className={`whitespace-nowrap px-4 py-2 rounded-md text-sm border transition-colors flex items-center gap-2
                  ${selectedIds.size > 0
                    ? 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 shadow-sm'
                    : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'}
                `}
              >
                Action groupées {selectedIds.size > 0 && `(${selectedIds.size})`}
                <ChevronDownIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-[#e7eaed] overflow-hidden">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Chargement...</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={paginatedData}
                emptyMessage="Aucun signalement pour le moment"
                pagination={{
                  currentPage,
                  totalPages,
                  totalItems,
                  onPageChange: setCurrentPage
                }}
              />
            )}
          </div>
        </div>
      </div>
    </RoleProtectedPage>
  )
}

