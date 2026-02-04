'use client'

import React, { useState } from 'react'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
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
import { HiSortDescending } from 'react-icons/hi'
import { BiImport } from 'react-icons/bi'

// --- Types & Mock Data ---

interface Archive {
  id: string
  isFavorite: boolean
  name: string
  date: string
  officialNumber: number
  author: string
  category: 'Sécurité publique' | 'Environnement' | 'Santé publique' | 'Commerce' | 'Transport' | 'Fonction publique' | 'Sans catégorie' | 'Panneau cassé'
  collectivity: string
}

const MOCK_ARCHIVES: Archive[] = [
  {
    id: '1',
    isFavorite: true,
    name: "Délibération relative à l'a...",
    date: '18 Dec. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Sécurité publique',
    collectivity: 'Nantes'
  },
  {
    id: '2',
    isFavorite: true,
    name: 'Arrêté municipal portant...',
    date: '10 Dec. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Environnement',
    collectivity: 'Saint sébastien...'
  },
  {
    id: '3',
    isFavorite: true,
    name: 'Délibération concernant l...',
    date: '9 Dec. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Santé publique',
    collectivity: 'Nantes'
  },
  {
    id: '4',
    isFavorite: true,
    name: 'Arrêté portant sur la lutte...',
    date: '1 Dec. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Commerce',
    collectivity: 'Vertou'
  },
  {
    id: '5',
    isFavorite: true,
    name: 'Délibération relative au b...',
    date: '25 Nov. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Transport',
    collectivity: 'Nantes'
  },
  {
    id: '6',
    isFavorite: true,
    name: 'Arrêté portant autorisatio...',
    date: '18 Nov. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Fonction publique',
    collectivity: 'Nantes'
  },
  {
    id: '7',
    isFavorite: true,
    name: 'Délibération concernant l...',
    date: '29 Oct. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Sans catégorie',
    collectivity: 'Nantes'
  },
  {
    id: '8',
    isFavorite: true,
    name: 'Délibération portant créa...',
    date: '22 Oct. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Fonction publique',
    collectivity: 'Nantes'
  },
  {
    id: '9',
    isFavorite: true,
    name: 'Arrêté portant réglem...',
    date: '22 Oct. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Panneau cassé',
    collectivity: 'Nantes'
  },
  {
    id: '10',
    isFavorite: true,
    name: 'Arrêté municipal relatif a...',
    date: '21 Oct. 2024',
    officialNumber: 315,
    author: 'Maire',
    category: 'Fonction publique',
    collectivity: 'Nantes'
  },
  {
    id: '11',
    isFavorite: true,
    name: 'Arrêté portant réglem...',
    date: '18 Dec. 2024',
    officialNumber: 315,
    author: 'Adjoint au maire',
    category: 'Panneau cassé',
    collectivity: 'Nantes'
  },
  {
    id: '12',
    isFavorite: true,
    name: 'Arrêté portant réglem...',
    date: '18 Dec. 2024',
    officialNumber: 315,
    author: 'Adjoint au maire',
    category: 'Fonction publique',
    collectivity: 'Nantes'
  },
  {
    id: '13',
    isFavorite: true,
    name: 'Arrêté portant réglem...',
    date: '18 Dec. 2024',
    officialNumber: 315,
    author: 'Adjoint au maire',
    category: 'Environnement',
    collectivity: 'Nantes'
  }
]

const CATEGORY_COLORS: Record<string, 'warning' | 'purple' | 'success' | 'orange' | 'error' | 'info' | 'neutral'> = {
  'Sécurité publique': 'warning',
  'Environnement': 'purple',
  'Santé publique': 'success',
  'Commerce': 'orange',
  'Transport': 'error',
  'Fonction publique': 'info',
  'Sans catégorie': 'neutral',
  'Panneau cassé': 'orange'
}

const FILTERS = [
  { label: 'Mes favoris', active: true, icon: <FiStar className="mr-2" /> },
  { label: 'sécurité publique', active: false },
  { label: 'Environnement', active: false },
  { label: 'Santé publique', active: false },
  { label: 'Commerce', active: false },
  { label: 'Transport', active: false },
  { label: 'Fonction publique', active: false },
  { label: 'Sans ca', active: false },
  { label: 'Action groupées', active: false, isDropdown: true }
]

import { useRouter } from 'next/navigation'

export default function ArchivesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
      <div className="p-8 w-full max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-[32px] font-bold text-[#242a35]">Toutes les archives</h1>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#16a34a] bg-green-50 px-3 py-1 rounded-full border border-green-200">
              Dernière mise à jour le xx / xx / xx
            </span>
            <Button variant="outline" className="flex items-center gap-2 text-slate-600 border-slate-300">
              <FiClock />
              Historique des imports
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher" 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#e67e22] w-full md:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Button */}
            <Button variant="outline" className="flex items-center gap-2 border-slate-200 text-slate-600">
              <FiFilter />
              Filtres
            </Button>

            {/* Sort Button */}
            <Button variant="outline" className="flex items-center gap-2 border-slate-200 text-slate-600">
              <HiSortDescending />
              trier par : le plus récent
            </Button>
          </div>

          <Button 
            variant="orange" 
            className="flex items-center gap-2 text-white"
            onClick={() => router.push('/mairie/archives/importer')}
          >
            <BiImport className="text-lg" />
            Importer des archives
          </Button>
        </div>

        {/* Categories / Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {FILTERS.map((filter, idx) => (
            <button
              key={idx}
              className={`
                whitespace-nowrap px-4 py-2 rounded-md text-sm border flex items-center
                ${filter.active 
                  ? 'bg-[#fff7ed] border-[#fdba74] text-[#ea580c] font-medium' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}
              `}
            >
              {filter.icon && filter.icon}
              {filter.label}
              {filter.isDropdown && <span className="ml-2">▼</span>}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-md shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f1f5f9] hover:bg-[#f1f5f9]">
                <TableHead className="w-[50px]">
                  <div className="flex justify-center">
                    <Checkbox />
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
              {MOCK_ARCHIVES.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex justify-center">
                      <Checkbox />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {item.isFavorite ? (
                        <FiStar className="text-[#fbbf24] fill-[#fbbf24] text-lg cursor-pointer" />
                      ) : (
                        <FiStar className="text-slate-300 text-lg cursor-pointer hover:text-[#fbbf24]" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-[#334155]">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-slate-500 whitespace-nowrap">
                    {item.date}
                  </TableCell>
                  <TableCell className="text-slate-500 text-center">
                    {item.officialNumber}
                  </TableCell>
                  <TableCell className="font-medium text-slate-700">
                    {item.author}
                  </TableCell>
                  <TableCell>
                    <TableBadge 
                      label={item.category} 
                      color={CATEGORY_COLORS[item.category] || 'neutral'} 
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-600">
                      <FiMapPin />
                      <span>{item.collectivity}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <FiMoreVertical size={18} />
                      </button>
                      <button className="text-slate-400 hover:text-blue-500 transition-colors">
                        <FiEye size={18} />
                      </button>
                      <button className="text-slate-400 hover:text-orange-500 transition-colors">
                        <FiEdit2 size={18} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      </div>
    </RoleProtectedPage>
  )
}
