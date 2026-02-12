"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import IncidentMap from "@/components/map/IncidentMap"
import SignalementCard from "@/components/signalements/SignalementCard"
import CardIncident from "@/components/ui/CardIncident"
import FilterDropdown, { FilterState } from "@/components/ui/FilterDropdown"
import { useAllSignalements } from "@/lib/hooks/useSignalements"
import { useTypesSignalement } from "@/lib/hooks/useTypesSignalement"
import { getPublicUrlFromPath } from "@/lib/services/storage.service"
import Button from "@/components/ui/Button"
import { AdjustmentsVerticalIcon, ExclamationTriangleIcon, BarsArrowDownIcon, WrenchIcon, TrashIcon, HomeIcon, LightBulbIcon } from "@heroicons/react/24/outline"
import { MdWaterDrop } from "react-icons/md"
import { FaMapSigns, FaRoad } from "react-icons/fa"
import Link from "next/link"
import type { Signalement } from "@/types/signalements"

export default function CartePage() {
  const router = useRouter()
  const { data: signalements = [], isLoading } = useAllSignalements()
  const { types } = useTypesSignalement()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [filters, setFilters] = useState<FilterState | null>(null)
  const [sortBy, setSortBy] = useState<'recent' | 'ancient'>('recent')

  // Filtrer les signalements
  const filteredSignalements = (signalements || []).filter((s) => {
    // Recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchTitle = s.titre?.toLowerCase().includes(query)
      const matchDesc = s.description?.toLowerCase().includes(query)
      if (!matchTitle && !matchDesc) return false
    }

    // Filtres
    if (!filters) return true

    // Filtrer par dates
    if (filters.startDate || filters.endDate) {
      const sigDate = new Date(s.created_at)
      if (filters.startDate) {
        const startDate = new Date(filters.startDate)
        if (sigDate < startDate) return false
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (sigDate > endDate) return false
      }
    }

    // Filtrer par thématiques
    if (filters.themes.length > 0) {
      const typeId = s.type_id
      const typeLibelle = types.find((t) => t.id === typeId)?.libelle
      if (!typeLibelle || !filters.themes.includes(typeLibelle)) return false
    }

    return true
  })

  // Trier par date selon le choix et prendre les 4 derniers
  const derniers4Signalements = [...filteredSignalements]
    .sort((a, b) => {
      const dateA = new Date(a.date_signalement || a.created_at || 0).getTime()
      const dateB = new Date(b.date_signalement || b.created_at || 0).getTime()
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB
    })
    .slice(0, 4)

  // Préparer les marqueurs pour la carte
  const markers = filteredSignalements
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => {
      const firstPhotoPath = (s as Signalement).photos_signalement?.[0]?.url
      const imageUrl = firstPhotoPath ? getPublicUrlFromPath(firstPhotoPath) : null

      return {
        id: String(s.id),
        titre: s.titre || "Incident",
        description: s.description || "",
        latitude: s.latitude,
        longitude: s.longitude,
        imageUrl,
        statut: s.statut || "En attente",
      }
    })

  // Fonctions utilitaires
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date inconnue"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getStatut = (statut?: string | null): "Signalé" | "En cours" | "Résolu" => {
    if (statut === "En cours") return "En cours"
    if (statut === "Résolu") return "Résolu"
    return "Signalé"
  }

  // Types d'incidents (données statiques pour la section du bas)
  const typesIncidents = [
    {
      id: 1,
      icon: ExclamationTriangleIcon,
      titre: "Route barrée",
      description: "Signalez toute interruption de circulation imprévue, un obstacle majeur ou un chantier non répertorié bloquant le passage des véhicules. Précisez si une déviation est en place ou si l'accès aux habitations est coupé. Votre aide est précieuse pour mettre à jour les plans de circulation.",
    },
    {
      id: 2,
      icon: MdWaterDrop,
      titre: "Inondations",
      description: "Déclarez une accumulation d'eau anormale sur la chaussée, un débordement de cours d'eau ou une bouche d'égout obstruée. Votre signalement permet d'intervenir rapidement pour prévenir les risques d'aquaplaning ou de dégâts matériels.",
    },
    {
      id: 3,
      icon: FaRoad,
      titre: "Chaussée abîmée",
      description: "Nid-de-poule, fissure importante ou affaissement du bitume : informez nos services techniques pour éviter les accidents et les dommages aux véhicules. Une photo du défaut aidera nos équipes à évaluer l'urgence des réparations.",
    },
    {
      id: 4,
      icon: TrashIcon,
      titre: "Détritus",
      description: "Signalez les dépôts sauvages, les poubelles débordantes ou la présence de déchets encombrants sur la voie publique. Ensemble, maintenons la propreté de nos quartiers et préservons notre environnement quotidien.",
    },
    {
      id: 5,
      icon: FaMapSigns,
      titre: "Panneau cassé",
      description: "Un panneau de signalisation tordu, illisible ou arraché peut compromettre la sécurité de tous. Indiquez-nous l'emplacement exact pour que nous puissions rétablir la signalisation réglementaire dans les plus brefs délais.",
    },
    {
      id: 6,
      icon: HomeIcon,
      titre: "Mobilier abîmé",
      description: "Signalez toute dégradation sur les bancs publics, les abribus, les potelets ou les barrières de sécurité. Le maintien du mobilier urbain en bon état garantit le confort et l'accessibilité de l'espace public pour chacun.",
    },
    {
      id: 7,
      icon: LightBulbIcon,
      titre: "Éclairage public",
      description: "Une rue plongée dans le noir ou un lampadaire qui clignote ? Signalez les pannes d'éclairage pour renforcer la sécurité nocturne des piétons et des conducteurs. Précisez si possible le numéro d'identification inscrit sur le mât.",
    },
  ]


  return (
    <div className="bg-[#f5fcfe] min-h-screen">

      <div className="bg-[#f7ad19] w-full px-4 py-5 flex items-center justify-center mb-8">
        <p className="font-['Montserrat'] font-medium text-[#242a35] text-[20px] text-center">
          ⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage.
        </p>
      </div>
      {/* En-tête avec titre et recherche */}
      <div className="">
        <div className="container px-12 mb-8">
          <h1 className="font-['Poppins'] font-semibold text-[36px] mb-8">
            Carte interactive des incidents
          </h1>

          {/* Barre de recherche */}
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Section carte avec filtres */}
      <div className="container px-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-['Poppins'] text-[30px] font-medium">
            Carte interactive des incidents signalés
          </h2>
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Button
                variant="outline"
                size="xs"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <AdjustmentsVerticalIcon className="w-5 h-5" />
                <span className="font-['Montserrat'] text-[16px]">Filtres</span>
              </Button>
              <FilterDropdown
                isOpen={showDropdown}
                onClose={() => setShowDropdown(false)}
                onApply={(newFilters: FilterState) => {
                  setFilters(newFilters)
                  setShowDropdown(false)
                }}
                onClear={() => {
                  setFilters(null)
                  setShowDropdown(false)
                }}
                themes={types}
              />
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setSortBy(sortBy === 'recent' ? 'ancient' : 'recent')}
              className="px-5"
            >
              <BarsArrowDownIcon className="w-5 h-5" />
              <span className="font-['Montserrat'] font-normal text-[16px] whitespace-nowrap">Trier par : {sortBy === 'recent' ? 'le plus récent' : 'le plus ancien'}</span>
            </Button>
          </div>
        </div>

        {/* Carte */}
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de la carte...</p>
            </div>
          </div>
        ) : markers.length > 0 ? (
          <div className="h-[520px]">
            <IncidentMap markers={markers} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
            <p className="text-gray-600">Aucun incident localisé à afficher</p>
          </div>
        )}

        {/* Liste des signalements sous la carte */}
        <div className="mt-8 mx-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Chargement des incidents...</p>
            </div>
          ) : derniers4Signalements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {derniers4Signalements.map((signalement) => {
                const firstPhotoPath = (signalement as Signalement).photos_signalement?.[0]?.url
                const imageUrl = firstPhotoPath ? getPublicUrlFromPath(firstPhotoPath) : undefined

                return (
                  <CardIncident
                    key={signalement.id}
                    title={signalement.titre || "Sans titre"}
                    label={signalement.statut || "Signalé"}
                    date={formatDate(signalement.date_signalement)}
                    username={`${signalement.prenom || ""} ${signalement.nom || "Anonyme"}`.trim()}
                    description={signalement.description || "Aucune description"}
                    image={imageUrl}
                    onClick={() => router.push(`/signalements/${signalement.id}`)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucun incident trouvé</p>
            </div>
          )}
        </div>

        {/* Bouton "Voir tout" - Affiché seulement s'il y a plus de 4 signalements */}
        {filteredSignalements.length > 4 && (
          <div className="flex justify-end mt-6">
            <Link href="/signalements">
              <Button size="xs" variant='primary'>
                Voir tout
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Section : Découvrez les différents types d'incidents signalés */}
      <div className="mt-8 mb-8 px-12">
        <div className="container">
          <h2 className="font-['Poppins'] text-[30px] font-medium mb-8">
            Découvrez les différents types d&apos;incidents signalés
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
            {typesIncidents.map((type) => {
              const IconComponent = type.icon
              const isLast = type.id === typesIncidents.length
              return (
                <div
                  key={type.id}
                  className={`bg-white rounded-2xl p-9 overflow-hidden shadow-sm hover:shadow-md transition-shadow w-[363px] h-[311px] ${isLast ? 'md:col-start-2 lg:col-start-2' : ''}`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <IconComponent size={32} width="32" height="32" className="flex-shrink-0 w-8 h-8" style={{ color: '#053F5C' }} />
                    <h3 className="font-['Poppins'] text-[20px] font-medium text-[#053F5C]">{type.titre}</h3>
                  </div>
                  <p className="font-['Montserrat'] text-[14px] font-normal">
                    {type.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
