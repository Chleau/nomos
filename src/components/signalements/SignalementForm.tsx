'use client'


import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSignalements } from '@/lib/hooks/useSignalements'
import { useTypesSignalement } from '@/lib/hooks/useTypesSignalement'
import { uploadSignalementPhoto } from '@/lib/services/storage.service'
import AlertBanner from '@/components/compte/AlertBanner';
import { createPhotoSignalement } from '@/lib/services/photos.service'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { PencilIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'

// Charger la carte dynamiquement côté client uniquement
const IncidentMap = dynamic(() => import('@/components/map/IncidentMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Chargement de la carte...</p>
    </div>
  )
})

export default function SignalementForm() {

  const router = useRouter()
  const { user } = useSupabaseAuth()
  const { data: habitant } = useCurrentHabitant(user?.id || null)
  const { createSignalement, updateSignalementUrl } = useSignalements()
  const { types, loading: loadingTypes, error: errorTypes } = useTypesSignalement()
  const [step, setStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [titre, setTitre] = useState('');
  const [typeId, setTypeId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  const [locationRetrieved, setLocationRetrieved] = useState(false);
  const [adresse, setAdresse] = useState('');
  const [date, setDate] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ typeId?: string; titre?: string; description?: string }>({});
  const [isMobile, setIsMobile] = useState(false);

  // Détecter si on est sur mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pré-remplir les champs avec les données de l'habitant connecté
  useEffect(() => {
    if (habitant) {
      setNom(habitant.nom || '')
      setPrenom(habitant.prenom || '')
      setEmail(habitant.email || '')
      // Le téléphone n'est pas dans le type Habitant actuel, on le laisse vide
    }
  }, [habitant])

  // Reverse geocode quand les coordonnées changent
  useEffect(() => {
    if (latitude && longitude) {
      reverseGeocode(latitude as number, longitude as number)
    }
  }, [latitude, longitude])
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [fullAddress, setFullAddress] = useState<string>('')
  const [loadingAddress, setLoadingAddress] = useState(false)

  // Fonction pour formater la date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Date inconnue'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Fonction pour faire du reverse geocoding (coordonnées → adresse)
  const reverseGeocode = async (lat: number, lon: number) => {
    setLoadingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Nomos-App'
          }
        }
      );
      const data = await response.json();

      if (data && data.address) {
        const houseNumber = data.address.house_number || ''
        const road = data.address.road || data.address.street || data.address.street_name || ''
        const city = data.address.city || data.address.town || data.address.village || data.address.municipality || ''
        const postalCode = data.address.postcode || ''

        const address = `${houseNumber} ${road}`.trim()
        const fullAddr = `${address} ${postalCode} ${city}`.trim()
        setFullAddress(fullAddr)
      }
    } catch (error) {
      console.error('Erreur de reverse géocodage:', error);
    } finally {
      setLoadingAddress(false)
    }
  };

  // Fonction pour ajouter des photos (utilisée par input et drag-drop)
  const handleAddPhotos = (newFiles: FileList | null) => {
    if (newFiles) {
      const newPhotos = Array.from(newFiles);
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  // Gestion du drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleAddPhotos(e.dataTransfer.files);
  };

  // Fonction pour géocoder une adresse
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Nomos-App' // Nominatim requiert un User-Agent
          }
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setLatitude(parseFloat(lat));
        setLongitude(parseFloat(lon));
        setLocationRetrieved(true);
      } else {
        alert("Impossible de trouver cette adresse. Vérifiez l'orthographe.");
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      alert("Erreur lors de la recherche de l'adresse.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    // Vérifier que l'habitant est bien connecté
    if (!habitant) {
      setMessage("Vous devez être connecté pour créer un signalement");
      setIsSubmitting(false);
      return;
    }

    // Préparer les données du signalement
    const signalementData = {
      titre,
      description,
      type_id: typeId === '' ? undefined : typeId,
      latitude: latitude === '' ? undefined : latitude,
      longitude: longitude === '' ? undefined : longitude,
      statut: 'Signalé',
      habitant_id: habitant.id,
      commune_id: habitant.commune_id,
      nom: habitant.nom,
      prenom: habitant.prenom,
      telephone: telephone || undefined,
      email: habitant.email,
    };

    // Création du signalement avec les données de l'habitant connecté
    const { data: signalement, error } = await createSignalement.mutateAsync(signalementData);

    if (error) {
      setMessage("Erreur lors de la création du signalement");
      setIsSubmitting(false);
      return;
    }

    if (!signalement) {
      setMessage("Erreur lors de la création du signalement");
      setIsSubmitting(false);
      return;
    }
    // Si des photos sont sélectionnées, upload puis création des entrées photo_signalement
    if (photos.length > 0) {
      try {
        let firstPhotoPath: string | undefined;
        for (let i = 0; i < photos.length; i++) {
          const path = await uploadSignalementPhoto(photos[i], signalement.id);
          await createPhotoSignalement(signalement.id, path);
          // Mémoriser le chemin de la première photo
          if (i === 0) {
            firstPhotoPath = path;
          }
        }
        // Met à jour l'URL avec la première photo dans le signalement
        if (firstPhotoPath) {
          await updateSignalementUrl.mutateAsync({ id: signalement.id, url: firstPhotoPath });
        }
      } catch (err) {
        setMessage("Signalement créé, mais erreur lors de l'upload des photos");
        setIsSubmitting(false);
        return;
      }
    }
    setShowSuccessModal(true);
    setTitre('');
    setDescription('');
    setTypeId('');
    setLatitude('');
    setLongitude('');
    setAdresse('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setPhotos([]);
    setTelephone('');
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
    <div className="relative min-h-screen">
      {/* Modal de succès */}
      {showSuccessModal && (
        <>
          {/* Overlay qui couvre toute la fenêtre viewport */}
          <div className="fixed inset-0 bg-black/50 z-50" />
          {/* Conteneur du modal centré dans la zone de contenu relative */}
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-12 w-[760px] h-[418px] md:h-[549px] mx-4 text-center flex flex-col items-center justify-center">
              {/* Titre */}
              <h2 className="font-['Montserrat'] md:font-['Poppins'] font-bold md:font-medium text-[20px] md:text-[30px] text-[#303039] mb-8">
                Votre signalement a été pris en compte
              </h2>

              {/* Sous-titre */}
              <p className="font-['Poppins'] md:font-['Montserrat'] font-medium md:font-normal text-[16px] md:text-[18px] text-[#303039] mb-12">
                Une vérification aura lieu
              </p>

              {/* Checkmark circle */}
              <div className="flex justify-center mb-8">
                <div className="w-26 md:w-35 h-26 md:h-35 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 md:w-20 md:h-20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
              </div>

              {/* Bouton Retour */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/signalements');
                }}
                className="h-[48px] py-3 px-6 border-1 border-[#053F5C] text-[#053F5C] font-['Poppins'] font-medium text-[16px] rounded-lg hover:bg-[#D9F5FB] transition-colors"
              >
                Retour
              </button>
            </div>
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="bg-[#f5fcfe] min-h-screen pb-20 md:pb-0">
        <div className="flex flex-col">
          {/* Alert Banner */}
          <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />
        </div>
        <h1 className="font-['Montserrat'] md:font-['Poppins] text-[20px] md:text-[36px] font-bold md:font-semibold mb-8 text-[#053F5C] text-center">Signaler un incident en ligne</h1>
        {/* Stepper header */}
        <div className="flex items-center justify-center mb-8 px-10 max-w-fit mx-auto">
          {[1, 2, 3].map((s, index) => (
            <div key={s} className="flex items-center">
              {/* Cercle de l'étape */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-1 mb-4 flex items-center justify-center font-normal text-sm ${step >= s
                  ? 'bg-[#0C4A6E] border-[#0C4A6E] text-white'
                  : 'bg-white border-[#0C4A6E] text-[#0C4A6E]'
                  }`}>
                  {s}
                </div>
                <span className={`text-[13px] text-center ${step >= s ? 'font-medium text-[#0C4A6E]' : 'text-[#053F5C]'}`}>
                  {s === 1 ? "L'incident" : s === 2 ? "Localisation" : "Vérification"}
                </span>
              </div>
              {/* Ligne de connexion (sauf pour le dernier) */}
              {index < 2 && (
                <div className="w-12 h-0.5 bg-[#475569] mx-2 mt-[-24px]"></div>
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="mb-4 w-full max-w-[934px] mx-auto px-2 md:px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-16 w-full pb-4 md:pb-8">
                <div className="w-full">
                  <label className="block mb-3 font-['Montserrat'] md:font-['Poppins] font-semibold md:font-medium text-[16px] md:text-[20px] text-[#053F5C]">Type d&apos;incident *</label>
                  <select
                    value={typeId}
                    onChange={e => setTypeId(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="h-[50px] w-full bg-[white] border border-gray-300 rounded-sm pl-3 pr-12 py-2 focus:outline-none focus:ring-1 focus:ring-[#053F5C]"
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
                  <label className="block mb-3 font-['Montserrat'] md:font-['Poppins] font-semibold md:font-medium text-[16px] md:text-[20px] text-[#053F5C]">Titre du problème *</label>
                  <input
                    type="text"
                    value={titre}
                    placeholder='Donnez un résumé en quelques mots'
                    onChange={e => setTitre(e.target.value)}
                    required
                    className="h-[50px] w-full bg-[white] border border-gray-300 rounded-sm px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#053F5C]" />

                  {errors.titre && <div className="text-red-500 text-sm mt-1">{errors.titre}</div>}
                </div>
              </div>

              <div className="mb-4">
                <label className="block mb-3 font-['Montserrat'] md:font-['Poppins] font-semibold md:font-medium text-[16px] md:text-[20px] text-[#053F5C]">Message *</label>
                <textarea
                  value={description}
                  placeholder='Expliquez ce qui se passe avec le plus de détails possibles'
                  onChange={e => setDescription(e.target.value)}
                  required
                  className="h-[131px] md:h-[180px] w-full bg-[white] border border-gray-300 rounded-sm px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#053F5C] min-h-[80px]" />
                {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className='w-full max-w-[982px] mx-auto px-2.5 md:px-4'>
              <div className="mb-4 pb-4">
                <label className="block mb-3 font-['Montserrat'] md:font-['Poppins] font-semibold md:font-medium text-[16px] md:text-[20px] text-[#053F5C]">Localisation de l&apos;incident</label>
                <div className="w-full mb-4">
                  <div className="relative">
                    <input
                      id="adresse-input"
                      type="text"
                      placeholder={isMobile ? "Saisissez une adresse" : "Saisissez une adresse (ex: 10 rue de la Paix, Paris) ou utilisez la géolocalisation"}
                      value={adresse}
                      onChange={e => {
                        setAdresse(e.target.value)
                        // Si l'utilisateur modifie l'adresse, on désactive le mode géolocalisation
                        if (locationRetrieved) {
                          setLocationRetrieved(false)
                        }
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          geocodeAddress(adresse);
                        }
                      }}
                      className="h-[50px] w-full bg-[white] border border-gray-300 rounded-sm px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#053F5C]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                      {/* Bouton de recherche d'adresse */}
                      <button
                        type="button"
                        onClick={() => geocodeAddress(adresse)}
                        disabled={isGeocoding || !adresse.trim()}
                        aria-label="Rechercher l&apos;adresse"
                        className="bg-white rounded-sm p-2 shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeocoding ? (
                          <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={locationRetrieved && !isGeocoding ? "#16a34a" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                          </svg>
                        )}
                      </button>
                      {/* Bouton de géolocalisation */}
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                              setLatitude(pos.coords.latitude)
                              setLongitude(pos.coords.longitude)
                              setLocationRetrieved(true)
                              setAdresse("Géolocalisation activée")
                            }, (error) => {
                              alert("Impossible d'accéder à votre position. Vérifiez les permissions de votre navigateur.");
                            })
                          } else {
                            alert("La géolocalisation n'est pas supportée par votre navigateur.");
                          }
                        }}
                        aria-label="Utiliser la géolocalisation"
                        className="bg-white rounded-sm p-2 shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={locationRetrieved && adresse === "Géolocalisation activée" ? "#16a34a" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a7 7 0 0 0 0-6"></path><path d="M4.6 9a7 7 0 0 0 0 6"></path></svg>
                      </button>
                    </div>
                  </div>
                  {locationRetrieved && latitude && longitude && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Position enregistrée : {latitude.toFixed(6)}, {longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-3 font-['Montserrat'] md:font-['Poppins] font-semibold md:font-medium text-[16px] md:text-[20px] text-[#053F5C]">Ajouter des photos</label>
                <div
                  className="relative"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    id="photo-upload"
                    onChange={e => handleAddPhotos(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {/* h-[50px] w-full bg-[white] border border-gray-300 rounded-sm px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#053F5C] */}
                  <div className={`flex flex-col items-center justify-center cursor-pointer border border-dashed border-[#2D769A] rounded-sm px-6 py-8 w-full transition ${isDragging ? 'shadow-lg border-2 border-blue-400 bg-blue-50' : 'hover:shadow-lg'
                    }`}>
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mb-2 text-gray-400">
                      <path d="M12 16v-4m0 0V8m0 4h4m-4 0H8m12 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2m16 0V8a2 2 0 0 0-2-2h-3.17a2 2 0 0 1-1.41-.59l-1.83-1.83a2 2 0 0 0-1.41-.59H6a2 2 0 0 0-2 2v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[#94A3B8] text-lg">
                      {photos.length > 0 ? `${photos.length} photo(s) sélectionnée(s)` : "Importez une ou plusieurs images"}
                    </span>
                    <span className="hidden md:inline text-[#94A3B8] text-sm mt-2">ou glissez des images ici</span>
                  </div>
                </div>
                {/* Affichage des miniatures */}
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg shadow"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-lg transition opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            title="Supprimer cette photo"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 truncate">{photo.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Vos coordonnées */}
            <div className="mt-8 pt-8 border-t border-gray-200 hidden">
              <h3 className="text-lg font-semibold mb-6 text-gray-900">Vos coordonnées</h3>
              <div className="grid grid-cols-2 gap-4 w-full pb-8">
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    readOnly
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    value={prenom}
                    readOnly
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full pb-8">
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Téléphone</label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    placeholder="Optionnel"
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-1 font-medium text-gray-700">Adresse email</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="mx-auto mb-6">
            {/* Grid : Rappel de l'incident + Lieu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-[44px] px-2.5 md:px-12">
              {/* Card Rappel de l'incident */}
              <div>
                <div className="bg-white rounded-2xl shadow-md p-5 w-full h-[250px] md:h-[295px] relative">
                  <h3 className="font-['Poppins'] font-medium text-[16px] md:text-[20px] text-[#475569] mb-4">{titre || 'Sans titre'}</h3>

                  <div className="flex items-center gap-3 md:gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                      <span className="font-medium">Signalé</span>
                    </div>
                    <span className="text-sm text-[#053F5C]">Déclaré le {formatDate(new Date().toISOString())}</span>
                    <span className="text-sm font-medium">{prenom} {nom?.charAt(0) || 'M'}</span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-['Poppins'] font-medium text-[16px] md:text-[18px] text-[#64748B] mb-4">Contact</h4>
                    <div className='flex items-center gap-4 mb-4 text-sm'>
                      <p className="font-['Poppins'] font-regular text-[14px] text-gray-600">{telephone || 'Non renseigné'}</p>
                      <p className="font-['Poppins'] font-regular text-[14px] text-gray-600">{email || 'anonyme@gmail.com'}</p>
                    </div>
                  </div>

                  <p className="font-['Montserrat'] font-normal text-[14px] text-[#242A35] pr-10">
                    {description || 'Aucune description'}
                  </p>

                  <button
                    onClick={() => setStep(1)}
                    className="absolute p-2 text-[#053F5C] hover:bg-[#D9F5FB] rounded-lg transition-colors"
                    style={{ bottom: '25px', right: '25px' }}
                    title="Modifier le signalement"
                  >
                    <PencilIcon width="24" height="24" />
                  </button>
                </div>
              </div>

              {/* Card Lieu de l'incident */}
              <div>
                <div className="rounded-2xl shadow-md w-full h-[295px] relative overflow-hidden">
                  {/* Carte interactive */}
                  {latitude && longitude ? (
                    <div className="w-full h-full">
                      <IncidentMap
                        markers={[{
                          id: '1',
                          titre: titre,
                          description: description,
                          latitude: latitude as number,
                          longitude: longitude as number,
                          imageUrl: photos.length > 0 ? URL.createObjectURL(photos[0]) : null,
                          statut: 'Signalé'
                        }]}
                        center={[latitude as number, longitude as number]}
                        zoom={15}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2 text-gray-400">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <p className="text-sm text-gray-500">Pas de coordonnées disponibles</p>
                      </div>
                    </div>
                  )}

                  {/* Adresse en bas */}
                  {latitude && longitude && (
                    <div className="absolute bottom-0 left-0 right-0 h-[58px] bg-white/95 backdrop-blur-sm p-3 shadow-md flex items-center justify-between z-10">
                      <div className="flex items-center gap-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span className="font-['Montserrat'] font-normal text-[14px] text-[#053F5C]">
                          {loadingAddress ? 'Chargement...' : (fullAddress || (adresse || 'Adresse non disponible'))}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => {
                          navigator.clipboard.writeText(fullAddress || adresse || `${latitude}, ${longitude}`)
                        }}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-center gap-4 mt-4 md:mt-8">
          {step > 1 && (
            <button type="button" className="h-[48px] md:h-[59px] w-[109px] md:w-[133px] border border-[#64748B] hover:bg-[#D9F5FB] text-[#053F5C] text-[16px] md:text-[18px] font-['Poppins'] font-medium px-4 py-2 rounded-lg" onClick={() => setStep(step - 1)}>
              Précédent
            </button>
          )}
          {step < 3 && (
            <button type="button" className="h-[48px] md:h-[59px] w-[109px] md:w-[133px] bg-[#F27F09] hover:bg-[#F59839] text-[#242A35] text-[18px] font-['Poppins'] font-medium px-4 py-2 rounded-lg" onClick={handleNextStep}>
              Suivant
            </button>
          )}
          {step === 3 && (
            <button type="submit" className="h-[48px] md:h-[59px]] w-[109px] md:w-[133px] bg-[#F27F09] hover:bg-[#F59839] text-[#242A35] text-[18px] font-['Poppins'] font-medium px-4 py-2 rounded-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
            </button>
          )}
        </div>
        {message && <div className="mt-4 text-center text-sm text-green-700">{message}</div>}
      </form>
    </div>
  );
}