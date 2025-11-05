"use client"

import React, { useState } from "react"

type Filters = {
  statut: string
  type: string
  dateDebut: string
  dateFin: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  filters: Filters
  onApply: (filters: Filters) => void
}

export default function FiltresModal({ isOpen, onClose, filters, onApply }: Props) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters)

  if (!isOpen) return null

  const handleApply = () => {
    onApply(localFilters)
  }

  const handleReset = () => {
    const resetFilters = { statut: "", type: "", dateDebut: "", dateFin: "" }
    setLocalFilters(resetFilters)
    onApply(resetFilters)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Filtres</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Filtre Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={localFilters.statut}
              onChange={(e) => setLocalFilters({ ...localFilters, statut: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Tous les statuts</option>
              <option value="Signalé">Signalé</option>
              <option value="En cours">En cours</option>
              <option value="Résolu">Résolu</option>
            </select>
          </div>

          {/* Filtre Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type d&apos;incident
            </label>
            <select
              value={localFilters.type}
              onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Tous les types</option>
              <option value="1">Route barrée</option>
              <option value="2">Inondations</option>
              <option value="3">Chaussée abîmée</option>
              <option value="4">Détritus</option>
              <option value="5">Panneau cassé</option>
              <option value="6">Mobilier abîmé</option>
              <option value="7">Éclairage public</option>
            </select>
          </div>

          {/* Filtre Date début */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={localFilters.dateDebut}
              onChange={(e) => setLocalFilters({ ...localFilters, dateDebut: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          {/* Filtre Date fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={localFilters.dateFin}
              onChange={(e) => setLocalFilters({ ...localFilters, dateFin: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  )
}
