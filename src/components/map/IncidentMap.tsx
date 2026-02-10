"use client"

import React, { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fonctions utilitaires pour échapper le HTML
function escapeHtml(s: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }
  return s.replace(/[&<>"']/g, (c) => htmlEntities[c] || c)
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '%22')
}

// Fix pour les icônes par défaut de Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

type SignalementMarker = {
  id: string
  titre?: string
  description?: string
  latitude?: number | null
  longitude?: number | null
  imageUrl?: string | null
  statut?: string | null
}

type Props = {
  center?: [number, number]
  zoom?: number
  markers: SignalementMarker[]
}

export default function IncidentMap({
  center = [46.603354, 1.888334], // Centre de la France
  zoom = 6,
  markers,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // Initialiser la carte avec un délai pour laisser le DOM se mettre en place
  useEffect(() => {
    if (!mapRef.current) return

    const timer = setTimeout(() => {
      if (mapRef.current && !leafletMapRef.current) {
        try {
          const mapContainer = mapRef.current
          
          // Créer la carte
          const mapInstance = L.map(mapContainer, {
            center,
            zoom,
            trackResize: true,
          })

          // Ajouter les tiles
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapInstance)

          // Important: invalider la taille pour que Leaflet recalcule
          setTimeout(() => {
            mapInstance.invalidateSize()
          }, 0)

          leafletMapRef.current = mapInstance
          setMapReady(true)
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de la carte:', error)
        }
      }
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const mapInstance = leafletMapRef.current
    if (!mapInstance || !mapReady) return

    // Nettoyer les markers existants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = (mapInstance as any)._nomos_markers
    if (existing) {
      mapInstance.removeLayer(existing)
    }

    const markersGroup = L.layerGroup()

    // Ajouter les markers
    for (const m of markers) {
      if (m.latitude == null || m.longitude == null) continue

      const newMarker = L.marker([m.latitude, m.longitude])
      
      // Créer le contenu du popup
      let popupContent = ""
      if (m.titre) popupContent += `<strong>${escapeHtml(m.titre)}</strong><br/>`
      if (m.statut) popupContent += `<span style="font-size:0.875rem;color:#666">Statut: ${escapeHtml(m.statut)}</span><br/>`
      if (m.description) popupContent += `<div style="margin-top:8px">${escapeHtml(m.description)}</div>`
      if (m.imageUrl) {
        popupContent += `<div style="margin-top:8px"><img src="${escapeAttr(m.imageUrl)}" alt="photo" style="max-width:200px;max-height:150px;object-fit:cover;border-radius:6px"/></div>`
      }

      newMarker.bindPopup(popupContent, { maxWidth: 300 })
      markersGroup.addLayer(newMarker)
    }

    // Sauvegarder et ajouter le groupe à la carte
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mapInstance as any)._nomos_markers = markersGroup
    markersGroup.addTo(mapInstance)

    // Ajuster la vue pour inclure tous les markers
    const validCoords = markers
      .filter((m) => m.latitude != null && m.longitude != null)
      .map((m) => [m.latitude as number, m.longitude as number] as [number, number])
    
    if (validCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(validCoords)
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
      } catch (error) {
        // Ignorer les erreurs de fitBounds
        console.warn('Erreur fitBounds:', error)
      }
    }
  }, [markers, mapReady])

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-200 relative z-0">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
