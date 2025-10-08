'use client'


import { useState, useRef } from 'react'
import { useSignalements } from '@/lib/hooks/useSignalements'
import { useTypesSignalement } from '@/lib/hooks/useTypesSignalement'
import { uploadSignalementPhoto } from '@/lib/services/storage.service'
import { createPhotoSignalement } from '@/lib/services/photos.service'

export default function SignalementForm() {

  const { createSignalement, updateSignalementUrl } = useSignalements()
  const { types, loading: loadingTypes, error: errorTypes } = useTypesSignalement()
  const [step, setStep] = useState(1);
  const [titre, setTitre] = useState('');
  const [typeId, setTypeId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [adresse, setAdresse] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ typeId?: string; titre?: string; description?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
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
    });
    if (error || !signalement) {
      setMessage("Erreur lors de la création du signalement");
      setIsSubmitting(false);
      return;
    }
    // Si une photo est sélectionnée, upload puis création de l'entrée photo_signalement et update url dans signalement
    if (photo) {
      try {
        const path = await uploadSignalementPhoto(photo, signalement.id);
        await createPhotoSignalement(signalement.id, path);
        // Met à jour l'URL dans le signalement
        await updateSignalementUrl.mutateAsync({ id: signalement.id, url: path });
      } catch (err) {
        setMessage("Signalement créé, mais erreur lors de l'upload de la photo");
        setIsSubmitting(false);
        return;
      }
    }
    setMessage("Signalement créé avec succès !");
    setTitre('');
    setDescription('');
    setTypeId('');
    setLatitude('');
    setLongitude('');
    setAdresse('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPhoto(null);
    setNom('');
    setPrenom('');
    setTelephone('');
    setEmail('');
    setStep(1);
    setIsSubmitting(false);
  };


  // Gestion du passage au step suivant avec validation
  const handleNextStep = () => {
    const newErrors: { typeId?: string; titre?: string; description?: string } = {};
    if (!typeId) newErrors.typeId = "Sélectionnez la catégorie";
    if (!titre) newErrors.titre = "Entrez un titre";
    if (!description) newErrors.description = "Entrez un message";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setStep(step + 1);
    }
  };

  // Stepper rendering
  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-0 max-w-3xl w-full">
      <h1 className="text-5xl font-bold mb-8 text-black text-center">Signaler un incident en ligne</h1>
      {/* Stepper header */}
      <div className="flex items-center justify-between mb-8 px-10">
        {[1, 2, 3, 4].map((s, index) => (
          <div key={s} className="flex items-center">
            {/* Cercle de l'étape */}
            <div className="flex flex-col items-center">
              <div className={`w-4 h-4 rounded-xl border-2 mb-2 ${
                step >= s 
                  ? 'bg-black border-black-600' 
                  : 'bg-white border-gray-300'
              }`}></div>
              <span className={`text-sm ${step >= s ? 'font-bold text-black-600' : 'text-gray-400'}`}>
                {s === 1 ? "L'incident" : s === 2 ? "Localisation" : s === 3 ? "Vos coordonnées" : "Vérification"}
              </span>
            </div>
            {/* Ligne de connexion (sauf pour le dernier) */}
            {index < 3 && (
              <div className="w-10 h-0.5 bg-gray-300 mx-2 mt-[-24px]"></div>
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <>
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4 w-full pb-8">
              <div className="w-full">
                <label className="block mb-3 font-medium text-gray-700">Type d'incident *</label>
                <select
                  value={typeId}
                  onChange={e => setTypeId(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full border border-gray-300 rounded-xl pl-3 pr-12 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="" disabled>Sélectionnez la catégorie</option>
                  {loadingTypes && <option>Chargement...</option>}
                  {errorTypes && <option disabled>Erreur de chargement</option>}
                  {types && types.map((type) => (
                    <option key={type.id} value={type.id}>{type.libelle}</option>
                  ))}
                </select>
                {errors.typeId && <div className="text-red-500 text-sm mt-1">{errors.typeId}</div>}
              </div>
              <div className="w-full">
                <label className="block mb-3 font-medium text-gray-700">Titre du problème *</label>
                <input
                  type="text"
                  value={titre}
                  placeholder='Donnez un résumé en quelques mots'
                  onChange={e => setTitre(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />

                {errors.titre && <div className="text-red-500 text-sm mt-1">{errors.titre}</div>}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-3 font-medium text-gray-700">Message *</label>
              <textarea
                value={description}
                placeholder='Expliquez ce qui se passe avec le plus de détails possibles'
                onChange={e => setDescription(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]" />
              {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
            </div>
          </div>
        </>
      )}
      {step === 2 && (
        <>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Localisation de l’incident</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                className="bg-blue-500 text-white px-3 py-1 rounded-xl hover:bg-blue-600"
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
                className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                value={longitude}
                onChange={e => setLongitude(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-1/2 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <input
              type="text"
              placeholder="Adresse (optionnel)"
              value={adresse}
              onChange={e => setAdresse(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Ajouter une photo</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                id="photo-upload"
                onChange={e => setPhoto(e.target.files ? e.target.files[0] : null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center cursor-pointer bg-white rounded-2xl shadow px-6 py-8 w-full transition hover:shadow-lg">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2 text-gray-400">
                  <path d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2m16 0V8a2 2 0 0 0-2-2h-3.17a2 2 0 0 1-1.41-.59l-1.83-1.83a2 2 0 0 0-1.41-.59H6a2 2 0 0 0-2 2v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-gray-400 text-lg">{photo ? photo.name : "Importez une image"}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Nom</label>
            <input type="text" value={nom} onChange={e => setNom(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Prénom</label>
            <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Téléphone</label>
            <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Adresse email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </>
      )}

      {/* Step 4 : Récap */}
      {step === 4 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li><b>Type :</b> {types?.find(t => t.id === typeId)?.libelle || ''}</li>
            <li><b>Titre :</b> {titre}</li>
            <li><b>Description :</b> {description}</li>
            <li><b>Latitude :</b> {latitude} <b>Longitude :</b> {longitude}</li>
            <li><b>Adresse :</b> {adresse}</li>
            <li><b>Nom :</b> {nom} <b>Prénom :</b> {prenom}</li>
            <li><b>Téléphone :</b> {telephone}</li>
            <li><b>Email :</b> {email}</li>
            <li><b>Photo :</b> {photo ? photo.name : 'Aucune'}</li>
          </ul>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-center gap-4 mt-8">
        {step > 1 && (
          <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded" onClick={() => setStep(step - 1)}>
            Précédent
          </button>
        )}
        {step < 4 && (
          <button type="button" className="bg-black hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded" onClick={handleNextStep}>
            Suivant
          </button>
        )}
        {step === 4 && (
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded" disabled={isSubmitting}>
            {isSubmitting ? 'Envoi en cours...' : 'Valider'}
          </button>
        )}
      </div>
      {message && <div className="mt-4 text-center text-sm text-green-700">{message}</div>}
    </form>
  );
}