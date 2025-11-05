"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import IncidentMap from "@/components/map/IncidentMap"
import SignalementCard from "@/components/signalements/SignalementCard"
import FiltresModal from "@/components/signalements/FiltresModal"
import { useAllSignalements } from "@/lib/hooks/useSignalements"
import { getPublicUrlFromPath } from "@/lib/services/storage.service"

export default function CartePage() {
  const router = useRouter()
  const { data: signalements = [], isLoading } = useAllSignalements()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [filters, setFilters] = useState({
    statut: "",
    type: "",
    dateDebut: "",
    dateFin: "",
  })

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
    if (filters.statut && s.statut !== filters.statut) return false
    if (filters.type && s.type_id?.toString() !== filters.type) return false

    return true
  })

  // Trier par date (plus récent en premier) et prendre les 4 derniers
  const derniers4Signalements = [...filteredSignalements]
    .sort((a, b) => {
      const dateA = new Date(a.date_signalement || a.created_at || 0).getTime()
      const dateB = new Date(b.date_signalement || b.created_at || 0).getTime()
      return dateB - dateA // Tri décroissant (plus récent en premier)
    })
    .slice(0, 4)

  // Préparer les marqueurs pour la carte
  const markers = filteredSignalements
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => {
      const firstPhotoPath = (s as any).photos_signalement?.[0]?.url
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
      icon: "🚧",
      titre: "Route barrée",
      description: "Lorem ipsum dolor sit amet consectetur. Dectetur sem et pharetra vulputate viverra ut facilisis. Tempus tempor molestie auctor elit sit cursus. Nisi dolor et biomat Aliquam mi urna ploin viverra et ac eu egestas vestibulum.",
    },
    {
      id: 2,
      icon: "💧",
      titre: "Inondations",
      description: "Lorem ipsum dolor sit amet consectetur. Dectetur sem et pharetra vulputate viverra ut facilisis. Tempus tempor molestie auctor elit sit cursus. Nisi dolor et biomat Aliquam mi urna ploin viverra et ac eu egestas vestibulum.",
    },
    {
      id: 3,
      icon: "🚗",
      titre: "Chaussée abîmée",
      description: "Lorem ipsum dolor sit amet consectetur. Dectetur sem et pharetra vulputate viverra ut facilisis. Tempus tempor molestie auctor elit sit cursus. Nisi dolor et biomat Aliquam mi urna ploin viverra et ac eu egestas vestibulum.",
    },
    {
      id: 4,
      icon: "🗑️",
      titre: "Détritus",
      description: "Lorem ipsum dolor sit amet consectetur. Dectetur sem et pharetra vulputate viverra ut facilisis. Tempus tempor molestie auctor elit sit cursus. Nisi dolor et biomat Aliquam mi urna ploin viverra et ac eu egestas vestibulum.",
    },
    {
      id: 5,
      icon: "🪧",
      titre: "Panneau cassé",
      description: "Lorem ipsum dolor sit amet consectetur. Dectetur sem et pharetra vulputate viverra ut facilisis. Tempus tempor molestie auctor elit sit cursus. Nisi dolor et biomat Aliquam mi urna ploin viverra et ac eu egestas vestibulum.",
    },
    {
      id: 6,
      icon: "📱",
      titre: "Mobilier abîmé",
      description: "Lorem ipsum dolor sit amet consectetur. Dectetur sem et pharetra vulputate viverra ut facilisis. Tempus tempor molestie auctor elit sit cursus. Nisi dolor et biomat Aliquam mi urna ploin viverra et ac eu egestas vestibulum.",
    },
    {
      id: 7,
      icon: "💡",
      titre: "Éclairage public",
      description: "Lorem ipsum dolor sit amet consectetur. Dectetur sem et pharetra vulputate viverra ut facilisis. Tempus tempor molestie auctor elit sit cursus. Nisi dolor et biomat Aliquam mi urna ploin viverra et ac eu egestas vestibulum.",
    },
  ]


  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec titre et recherche */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Carte interactive des incidents
          </h1>
          
          {/* Barre de recherche */}
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Section carte avec filtres */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Carte interactive des incidents signalés
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
              Filtres
            </button>
            <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors">
              Trier par : le plus récent
            </button>
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
          <div className="h-[400px]">
            <IncidentMap markers={markers} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[400px] bg-gray-100 rounded-lg">
            <p className="text-gray-600">Aucun incident localisé à afficher</p>
          </div>
        )}

        {/* Liste des signalements sous la carte */}
        <div className="mt-8">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Chargement des incidents...</p>
            </div>
          ) : derniers4Signalements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {derniers4Signalements.map((signalement) => {
                const firstPhotoPath = (signalement as any).photos_signalement?.[0]?.url
                const imageUrl = firstPhotoPath ? getPublicUrlFromPath(firstPhotoPath) : undefined

                return (
                  <SignalementCard
                    key={signalement.id}
                    titre={signalement.titre || "Sans titre"}
                    statut={getStatut(signalement.statut)}
                    date={formatDate(signalement.date_signalement)}
                    auteur={`${signalement.prenom || ""} ${signalement.nom || "Anonyme"}`.trim()}
                    description={signalement.description || "Aucune description"}
                    coordonnees={
                      signalement.latitude && signalement.longitude
                        ? `${signalement.latitude}, ${signalement.longitude}`
                        : undefined
                    }
                    imageUrl={imageUrl}
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
          <div className="text-center mt-8">
            <button
              onClick={() => router.push("/signalements")}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Voir tout ({filteredSignalements.length} incidents)
            </button>
          </div>
        )}
      </div>

      {/* Section : Découvrez les différents types d'incidents signalés */}
      <div className="py-12 mt-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Découvrez les différents types d&apos;incidents signalés
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {typesIncidents.map((type) => (
              <div
                key={type.id}
                className="bg-white border border-black rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{type.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{type.titre}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Filtres */}
      {showFilters && (
        <FiltresModal
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onApply={(newFilters: typeof filters) => {
            setFilters(newFilters)
            setShowFilters(false)
          }}
        />
      )}
    </div>
  )
}
