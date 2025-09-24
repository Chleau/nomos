'use client'

import { useState } from 'react'
import { useSignalements } from '@/lib/hooks/useSignalements'

export default function SignalementForm() {
  const { createSignalement } = useSignalements()
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    const { error } = await createSignalement.mutateAsync({
      titre,
      description,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
    })
    if (error) {
      setMessage("Erreur lors de la création du signalement")
    } else {
      setMessage("Signalement créé avec succès !")
      setTitre('')
      setDescription('')
      setLatitude('')
      setLongitude('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Nouveau signalement</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Titre *</label>
        <input type="text" value={titre} onChange={e => setTitre(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]" />
      </div>
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block mb-1 font-medium text-gray-700">Latitude</label>
          <input type="number" value={latitude} onChange={e => setLatitude(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="flex-1">
          <label className="block mb-1 font-medium text-gray-700">Longitude</label>
          <input type="number" value={longitude} onChange={e => setLongitude(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition-colors">Créer</button>
      {message && <div className="mt-4 text-center text-sm text-green-700">{message}</div>}
    </form>
  )
}
