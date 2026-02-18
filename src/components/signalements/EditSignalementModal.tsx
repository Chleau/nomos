'use client'

import { useState } from 'react'
import { useSignalements } from '@/lib/hooks/useSignalements'
import type { Signalement } from '@/types/signalements'

interface EditSignalementModalProps {
  signalement: Signalement
  onClose: () => void
}

export default function EditSignalementModal({ signalement, onClose }: EditSignalementModalProps) {
  const [formData, setFormData] = useState({
    titre: signalement.titre || '',
    description: signalement.description || '',
    telephone: signalement.telephone || '',
    email: signalement.email || ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateSignalement } = useSignalements()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      // Convertir les chaînes vides en null pour éviter l'erreur "invalid input syntax for type numeric"
      const updates = {
        titre: formData.titre || null,
        description: formData.description || null,
        telephone: formData.telephone || null,
        email: formData.email || null
      }

      const result = await updateSignalement.mutateAsync({
        id: signalement.id,
        updates
      })

      if (result.error) {
        setError(result.error.message || 'Erreur lors de la sauvegarde')
        console.error('Erreur:', result.error)
      } else {
        onClose()
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Une erreur est survenue lors de la sauvegarde'
      setError(errorMessage)
      console.error('Erreur:', errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6">
        <h2 className="font-['Poppins'] font-semibold text-[24px] mb-6">Modifier le signalement</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm font-['Poppins']">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block font-['Poppins'] font-medium text-[14px] text-[#475569] mb-2">
              Titre
            </label>
            <input
              type="text"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#053F5C]"
              placeholder="Titre du signalement"
            />
          </div>

          <div>
            <label className="block font-['Poppins'] font-medium text-[14px] text-[#475569] mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#053F5C] resize-none"
              placeholder="Description détaillée"
              rows={4}
            />
          </div>

          <div>
            <label className="block font-['Poppins'] font-medium text-[14px] text-[#475569] mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#053F5C]"
              placeholder="Numéro de téléphone"
            />
          </div>

          <div>
            <label className="block font-['Poppins'] font-medium text-[14px] text-[#475569] mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#053F5C]"
              placeholder="Adresse email"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 border border-[#64748B] text-[#053F5C] rounded-lg font-['Poppins'] font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-[#053F5C] text-white rounded-lg font-['Poppins'] font-medium hover:bg-[#0a3d5c] transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
