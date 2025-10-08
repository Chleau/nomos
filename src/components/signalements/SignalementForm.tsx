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
  const [locationRetrieved, setLocationRetrieved] = useState(false);
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
      <div className="flex items-center justify-center mb-8 px-10">
        {[1, 2, 3, 4].map((s, index) => (
          <div key={s} className="flex items-center">
            {/* Cercle de l'étape */}
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-xl border-2 mb-2 ${step >= s
                ? 'bg-black border-black-600'
                : 'bg-white border-gray-300'
                }`}></div>
              <span className={`text-[12px] ${step >= s ? 'font-bold text-black-600' : 'text-gray-400'}`}>
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
          <div className="mb-4 pb-4">
            <label className="block mb-3 font-medium text-gray-700">Localisation de l'incident</label>
            <div className="w-full mb-4">
              <div className="relative">
                <input
                  id="adresse-input"
                  type="text"
                  placeholder="Utilisez la géolocalisation automatique ou saisissez l'adresse manuellement"
                  value={adresse}
                  onChange={e => {
                    setAdresse(e.target.value)
                    // Si l'utilisateur modifie l'adresse, on désactive le mode géolocalisation
                    if (locationRetrieved) {
                      setLocationRetrieved(false)
                    }
                  }}
                  className="w-full bg-white rounded-full px-6 py-3 placeholder-gray-400 text-gray-700 shadow-sm border border-transparent focus:outline-none focus:shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setLatitude(pos.coords.latitude)
                        setLongitude(pos.coords.longitude)
                        setLocationRetrieved(true)
                        setAdresse("Géolocalisation activée")
                      })
                    }
                  }}
                  aria-label="Utiliser la géolocalisation"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={locationRetrieved ? "#16a34a" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a7 7 0 0 0 0-6"></path><path d="M4.6 9a7 7 0 0 0 0 6"></path></svg>
                </button>
              </div>
            </div>
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
          <div className="grid grid-cols-2 gap-4 w-full pb-8">
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Nom</label>
              <input type="text" value={nom} onChange={e => setNom(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Prénom</label>
              <input type="text" value={prenom} onChange={e => setPrenom(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full pb-8">
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Téléphone</label>
              <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
          </div>
        </>
      )}

      {/* Step 4 : Récap */}
      {step === 4 && (
        <div className="mb-6">
          {/* Grid pour les deux cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Section Rappel de l'incident */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Rappel de l'incident</h3>
              <div className="bg-white rounded-3xl shadow-lg p-8 relative">
                {/* Titre de l'incident en italique */}
                <h4 className="text-xl italic mb-6 text-black">{titre}</h4>
                
                {/* Badge Signalé + Date + Nom */}
                <div className="flex items-center gap-4 mb-6 text-sm flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                    <span className="font-medium">Signalé</span>
                  </div>
                  <span className="text-gray-500">
                    Déclaré le {new Date().toLocaleDateString('fr-FR')}
                  </span>
                  <span className="text-gray-700 font-medium">
                    {prenom} {nom}
                  </span>
                </div>

                {/* Section Contact */}
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-700 mb-3">Contact</h5>
                  <div className="text-gray-600 space-y-1">
                    {telephone && <div>{telephone}</div>}
                    {email && <div>{email}</div>}
                  </div>
                </div>

                {/* Description */}
                <div className="text-gray-700 leading-relaxed mb-4">
                  {description}
                </div>

                {/* Type et localisation */}
                <div className="text-sm text-gray-500 space-y-1 mb-4">
                  <div><span className="font-medium">Type :</span> {types?.find(t => t.id === typeId)?.libelle || ''}</div>
                  {photo && <div><span className="font-medium">Photo :</span> {photo.name}</div>}
                </div>

                {/* Icône d'édition en bas à droite */}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="absolute bottom-6 right-6 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                  aria-label="Modifier"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Section Lieu de l'incident */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Lieu de l'incident</h3>
              <div className="bg-white rounded-3xl shadow-lg p-8 relative flex flex-col">
                {/* Zone de la map (vide pour l'instant) */}
                <div className="flex-1 bg-gray-100 rounded-2xl mb-4 min-h-[300px] flex items-center justify-center relative overflow-hidden">
                  {/* Pattern de map placeholder */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full" viewBox="0 0 400 300">
                      <path d="M50,100 L100,50 L150,80 L200,40 L250,70 L300,30" stroke="#9CA3AF" strokeWidth="2" fill="none"/>
                      <path d="M20,150 L80,120 L140,160 L200,130 L260,170 L320,140 L380,180" stroke="#9CA3AF" strokeWidth="2" fill="none"/>
                      <circle cx="200" cy="150" r="30" fill="#EF4444" opacity="0.5"/>
                    </svg>
                  </div>
                  {/* Icône de localisation au centre */}
                  <div className="relative z-10 bg-white rounded-full p-3 shadow-md">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                </div>

                {/* Adresse en bas */}
                <div className="flex items-start gap-2 text-gray-700">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span className="text-sm">
                    {locationRetrieved ? 'Géolocalisation activée' : (adresse || 'Non renseignée')}
                  </span>
                </div>

                {/* Icône de copie en bas à droite */}
                <button
                  type="button"
                  onClick={() => {
                    if (latitude && longitude) {
                      navigator.clipboard.writeText(`${latitude}, ${longitude}`)
                    }
                  }}
                  className="absolute bottom-6 right-6 w-10 h-10 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 transition"
                  aria-label="Copier les coordonnées"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
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