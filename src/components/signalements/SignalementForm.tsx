'use client'


import { useState } from 'react'
import { useSignalements } from '@/lib/hooks/useSignalements'
import { useTypesSignalement } from '@/lib/hooks/useTypesSignalement'
import { uploadSignalementPhoto } from '@/lib/services/storage.service'
import { createPhotoSignalement } from '@/lib/services/photos.service'

export default function SignalementForm() {

  const { createSignalement, updateSignalementUrl } = useSignalements()
  const { types, loading: loadingTypes, error: errorTypes } = useTypesSignalement()
  const [titre, setTitre] = useState('')
  const [typeId, setTypeId] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [latitude, setLatitude] = useState<number | ''>('')
  const [longitude, setLongitude] = useState<number | ''>('')
  const [adresse, setAdresse] = useState('')
  // localisation supprimé, on utilise latitude/longitude/adresse
  const [date, setDate] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    // Création du signalement sans la photo
    const { data: signalement, error } = await createSignalement.mutateAsync({
      titre,
      description,
      type_id: typeId === '' ? undefined : typeId,
      latitude: latitude === '' ? undefined : latitude,
      longitude: longitude === '' ? undefined : longitude,
      nom,
      prenom,
      telephone,
      email,
    })
    if (error || !signalement) {
      setMessage("Erreur lors de la création du signalement")
      return
    }
    // Si une photo est sélectionnée, upload puis création de l'entrée photo_signalement et update url dans signalement
    if (photo) {
      try {
        const path = await uploadSignalementPhoto(photo, signalement.id)
        await createPhotoSignalement(signalement.id, path)
        // Met à jour l'URL dans le signalement
        await updateSignalementUrl.mutateAsync({ id: signalement.id, url: path })
      } catch (err) {
        setMessage("Signalement créé, mais erreur lors de l'upload de la photo")
        return
      }
    }
    setMessage("Signalement créé avec succès !")
    setTitre('')
    setDescription('')
    setTypeId('')
    setLatitude('')
    setLongitude('')
    setAdresse('')
    setPhoto(null)
    setNom('')
    setPrenom('')
    setTelephone('')
    setEmail('')
  }
  

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-200 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">Signaler un incident en ligne</h2>
      
      {/* Premier step */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Type d'incident</label>
        <select
          value={typeId}
          onChange={e => setTypeId(e.target.value === '' ? '' : Number(e.target.value))}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="" disabled>Sélectionnez la catégorie</option>
          {loadingTypes && <option>Chargement...</option>}
          {errorTypes && <option disabled>Erreur de chargement</option>}
          {types && types.map((type) => (
            <option key={type.id} value={type.id}>{type.libelle}</option>
          ))}
        </select>
      </div>

      {/* Localisation */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Localisation de l’incident</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setLatitude(pos.coords.latitude)
                  setLongitude(pos.coords.longitude)
                })
              }
            }}
          >
            Utiliser ma position
          </button>
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={latitude}
            onChange={e => setLatitude(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={longitude}
            onChange={e => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-1/2 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <input
          type="text"
          placeholder="Adresse (optionnel)"
          value={adresse}
          onChange={e => setAdresse(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Titre du problème</label>
        <input type="text" value={titre} placeholder='Donnez un résumé en quelques mots' onChange={e => setTitre(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Description</label>
        <textarea value={description} placeholder='Expliquez ce qui se passe avec le plus de détails possibles' onChange={e => setDescription(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]" />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Ajouter une photo</label>
        <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files ? e.target.files[0] : null)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Nom</label>
        <input type="text" value={nom} onChange={e => setNom(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Prénom</label>
        <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Téléphone</label>
        <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Adresse email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
      </div>
      
      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition-colors">Créer</button>
      {message && <div className="mt-4 text-center text-sm text-green-700">{message}</div>}
    </form>
  )
}