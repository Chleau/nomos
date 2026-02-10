'use client'

import { useHabitants } from '@/lib/hooks/useHabitants'

export default function ListeHabitants() {
  const { habitants, isLoading, error } = useHabitants()

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 text-blue-700 rounded">
        Chargement des habitants...
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        Erreur lors du chargement des habitants: {error instanceof Error ? error.message : 'Erreur inconnue'}
      </div>
    )
  }

  if (!habitants || habitants.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-700 rounded">
        Aucun habitant trouvé dans la base de données.
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des habitants ({habitants.length})</h1>
      <div className="grid gap-4">
        {habitants.map((habitant) => (
          <div 
            key={habitant.id}
            className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="font-semibold">{habitant.prenom} {habitant.nom}</h2>
            <p className="text-gray-600">{habitant.email}</p>
            <p className="text-sm text-gray-500">
              Commune: {habitant.commune_id ?? 'Non spécifiée'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
