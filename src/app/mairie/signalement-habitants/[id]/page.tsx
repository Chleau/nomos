'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSignalement, useSignalements } from '@/lib/hooks/useSignalements'
import { useSuiviSignalement } from '@/lib/hooks/useSuiviSignalements'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant, useHabitantsByCommuneAndRoles } from '@/lib/hooks/useHabitants'
import { getPublicUrlFromPath } from '@/lib/services/storage.service'
import dynamic from 'next/dynamic'
import {
    BellIcon,
    PencilIcon,
    ChevronDownIcon,
    ClipboardIcon,
    ArrowLeftIcon,
    ShareIcon,
    CheckIcon,
    PhoneIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    UserIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'

// Charger la carte dynamiquement côté client uniquement
const IncidentMap = dynamic(() => import('@/components/map/IncidentMap'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chargement de la carte...</p>
        </div>
    )
})

export default function MairieSignalementDetailPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = params.id as string
    const isReadOnly = searchParams.get('mode') === 'view'

    const signalementId = Number.parseInt(id)
    const { data: signalement, isLoading, error } = useSignalement(signalementId)
    const { data: suivis, addSuivi } = useSuiviSignalement(signalementId)
    const { updateSignalement } = useSignalements()
    const { user } = useSupabaseAuth()
    const { data: me } = useCurrentHabitant(user?.id || null)
    const { data: agents } = useHabitantsByCommuneAndRoles(me?.commune_id || null, [UserRole.MAIRIE, UserRole.ADMIN])

    const [fullAddress, setFullAddress] = useState<string>('')
    const [loadingAddress, setLoadingAddress] = useState(false)
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
    const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false)
    const [isDecisionnaireDropdownOpen, setIsDecisionnaireDropdownOpen] = useState(false)
    const [isActionsDropdownOpen, setIsActionsDropdownOpen] = useState(false)
    const [annotation, setAnnotation] = useState('')
    const [isSubmittingAnnotation, setIsSubmittingAnnotation] = useState(false)

    // État pour l'édition du rappel
    const [isEditingRappel, setIsEditingRappel] = useState(false)
    const [isSavingRappel, setIsSavingRappel] = useState(false)
    const [editedTitre, setEditedTitre] = useState('')
    const [editedDescription, setEditedDescription] = useState('')
    const [editedTelephone, setEditedTelephone] = useState('')
    const [editedEmail, setEditedEmail] = useState('')
    const [editedNom, setEditedNom] = useState('')
    const [editedPrenom, setEditedPrenom] = useState('')

    const statutsConfig = {
        'Résolu': {
            bgColor: '#DBEAFE',
            textColor: '#059669',
            dotColor: '#10B981',
            borderColor: '#BAE6FD'
        },
        'En cours': {
            bgColor: '#FED7AA',
            textColor: '#D97706',
            dotColor: '#F59E0B',
            borderColor: '#FDBA74'
        },
        'Urgent': {
            bgColor: '#FECACA',
            textColor: '#DC2626',
            dotColor: '#EF4444',
            borderColor: '#FCA5A5'
        },
        'En attente': {
            bgColor: '#E2E8F0',
            textColor: '#475569',
            dotColor: '#64748B',
            borderColor: '#CBD5E1'
        }
    }

    const statuts = ['Résolu', 'En cours', 'Urgent', 'En attente']

    const getDisplayStatus = (status: string | null) => {
        if (!status || status === 'Signalé') return 'En attente'
        return status
    }

    const reverseGeocode = async (latitude: number, longitude: number) => {
        setLoadingAddress(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                { headers: { 'User-Agent': 'Nomos-App' } }
            );
            const data = await response.json();
            if (data && data.address) {
                const houseNumber = data.address.house_number || ''
                const road = data.address.road || data.address.street || ''
                const city = data.address.city || data.address.town || ''
                const postalCode = data.address.postcode || ''
                const address = `${houseNumber} ${road}`.trim()
                setFullAddress(`${address} ${city} ${postalCode}`.trim())
            }
        } catch (error) {
            console.error('Erreur de reverse géocodage:', error);
        } finally {
            setLoadingAddress(false)
        }
    };

    useEffect(() => {
        if (signalement?.latitude && signalement?.longitude) {
            reverseGeocode(signalement.latitude, signalement.longitude)
        }
    }, [signalement?.latitude, signalement?.longitude])

    useEffect(() => {
        if (searchParams.get('assign') === 'true') {
            setIsAgentDropdownOpen(true)
            // Scroll to the intervention section
            setTimeout(() => {
                const element = document.getElementById('intervention')
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            }, 100)
        }
    }, [searchParams])

    useEffect(() => {
        if (signalement) {
            setEditedTitre(signalement.titre || '')
            setEditedDescription(signalement.description || '')
            setEditedTelephone(signalement.telephone || '')
            setEditedEmail(signalement.email || '')
            setEditedNom(signalement.nom || '')
            setEditedPrenom(signalement.prenom || '')
        }
    }, [signalement])

    const handleSaveRappel = async () => {
        setIsSavingRappel(true)
        try {
            // Nettoyage des données : conversion des chaînes vides en null pour éviter les erreurs de type numeric en DB
            const updates = {
                titre: editedTitre || null,
                description: editedDescription || null,
                telephone: editedTelephone || null,
                email: editedEmail || null,
                nom: editedNom || null,
                prenom: editedPrenom || null
            }

            await updateSignalement.mutateAsync({
                id: signalementId,
                updates: updates as any
            })
            setIsEditingRappel(false)
            alert('Signalement mis à jour avec succès !')
        } catch (err: any) {
            console.error('Erreur lors de la sauvegarde du rappel:', err)
            alert(`Erreur lors de la sauvegarde : ${err.message || 'Une erreur est survenue'}`)
        } finally {
            setIsSavingRappel(false)
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Date inconnue'
        const date = new Date(dateString)
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const handleStatusChange = async (newStatut: string) => {
        try {
            const updates: any = { statut: newStatut }
            if (!signalement?.valide && me) {
                updates.valide = true
                updates.valide_par = me.id
                updates.date_validation = new Date().toISOString()
            }
            await updateSignalement.mutateAsync({
                id: signalementId,
                updates
            })
            setIsStatusDropdownOpen(false)
        } catch (err) {
            console.error('Erreur lors du changement de statut:', err)
        }
    }

    const handleAgentChange = async (habitant: any) => {
        try {
            await updateSignalement.mutateAsync({
                id: signalementId,
                updates: { agent_id: habitant.id } as any
            })
            setIsAgentDropdownOpen(false)
        } catch (err) {
            console.error('Erreur lors du changement d\'agent:', err)
        }
    }

    const handleValidate = async () => {
        if (!me) return;
        try {
            await updateSignalement.mutateAsync({
                id: signalementId,
                updates: {
                    valide: true,
                    valide_par: me.id,
                    date_validation: new Date().toISOString(),
                    statut: signalement?.statut === 'En attente' || !signalement?.statut ? 'En cours' : signalement?.statut
                } as any
            })
            setIsActionsDropdownOpen(false)
        } catch (err) {
            console.error('Erreur lors de la validation:', err)
        }
    }

    const handleDecisionnaireChange = async (habitant: any) => {
        try {
            await updateSignalement.mutateAsync({
                id: signalementId,
                updates: {
                    valide_par: habitant.id,
                    valide: true,
                    date_validation: signalement?.date_validation || new Date().toISOString()
                } as any
            })
            setIsDecisionnaireDropdownOpen(false)
        } catch (err) {
            console.error('Erreur lors du changement de décisionnaire:', err)
        }
    }

    const handleSubmitAnnotation = async () => {
        if (!annotation.trim() || isSubmittingAnnotation) return

        setIsSubmittingAnnotation(true)
        try {
            // Utiliser le nom et prénom de l'agent si disponible
            let authorName = 'Agent'
            if (me) {
                authorName = `${me.prenom} ${me.nom}`
            } else if (user?.user_metadata?.full_name || user?.user_metadata?.name) {
                authorName = user.user_metadata.full_name || user.user_metadata.name
            } else if (user?.email) {
                authorName = user.email
            }

            await addSuivi.mutateAsync({
                signalement_id: signalementId,
                auteur_id: user?.id || null,
                auteur_nom: authorName,
                titre: null,
                contenu: annotation,
                is_internal: true
            })
            setAnnotation('')
        } catch (err) {
            console.error("Erreur lors de l'envoi de l'annotation:", err)
        } finally {
            setIsSubmittingAnnotation(false)
        }
    }

    const getMessageInitials = (name: string | null) => {
        if (!name) return null;
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Chargement...</div>
    if (error || !signalement) return <div className="p-8 text-center text-red-500">Erreur lors du chargement</div>

    const photos = signalement.photos_signalement || []

    return (
        <RoleProtectedPage allowedRoles={[UserRole.MAIRIE, UserRole.ADMIN]}>
            <div className="bg-[#f5fcfe] min-h-screen px-8 py-6">
                <div className="max-w-7xl mx-auto text-[#053F5C]">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-6 py-2 bg-white border border-[#64748B] text-[#053F5C] text-sm rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>retour</span>
                        </button>
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-[#053F5C] hover:bg-white rounded-full transition-colors">
                                <BellIcon className="w-6 h-6" />
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setIsActionsDropdownOpen(!isActionsDropdownOpen)}
                                    className="p-2 text-[#053F5C] hover:bg-white rounded-full transition-colors"
                                >
                                    <EllipsisVerticalIcon className="w-6 h-6" />
                                </button>

                                {isActionsDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-[100] overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 text-center border-b border-gray-50">
                                            <span className="font-semibold text-[#053F5C] font-['Poppins']">Actions</span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setIsActionsDropdownOpen(false);
                                                setIsEditingRappel(true);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#053F5C] hover:bg-gray-50 transition-colors font-['Montserrat'] hover:text-[#053F5C]"
                                        >
                                            <PencilIcon className="w-5 h-5 text-gray-400" />
                                            <span>Modifier</span>
                                        </button>

                                        <button
                                            onClick={() => { setIsActionsDropdownOpen(false); window.location.href = `mailto:${signalement?.email}`; }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#053F5C] hover:bg-gray-50 transition-colors font-['Montserrat'] hover:text-[#053F5C]"
                                        >
                                            <PhoneIcon className="w-5 h-5 text-gray-400" />
                                            <span>Contacter l&apos;habitant</span>
                                        </button>

                                        <button
                                            onClick={() => { setIsActionsDropdownOpen(false); /* Download logic */ }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#053F5C] hover:bg-gray-50 transition-colors font-['Montserrat'] hover:text-[#053F5C]"
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5 text-gray-400" />
                                            <span>Télécharger</span>
                                        </button>

                                        <button
                                            onClick={() => { setIsActionsDropdownOpen(false); navigator.clipboard.writeText(window.location.href); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#053F5C] hover:bg-gray-50 transition-colors font-['Montserrat'] hover:text-[#053F5C]"
                                        >
                                            <ShareIcon className="w-5 h-5 text-gray-400" />
                                            <span>Partager</span>
                                        </button>

                                        <button
                                            onClick={async () => {
                                                if (confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
                                                    // Logic to delete (e.g. update status to deleted)
                                                    setIsActionsDropdownOpen(false);
                                                    router.back();
                                                }
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-['Montserrat']"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                            <span>Supprimer</span>
                                        </button>

                                        <div className="border-t border-gray-50 mt-1">
                                            <button
                                                onClick={() => {
                                                    setIsActionsDropdownOpen(false);
                                                    setIsAgentDropdownOpen(true);
                                                    document.getElementById('intervention')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }}
                                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-[#053F5C] hover:bg-gray-50 transition-colors font-['Montserrat']"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <UserIcon className="w-5 h-5 text-gray-400" />
                                                    <span>Assigner un agent</span>
                                                </div>
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Header Title & Status */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 font-['Poppins']">
                            <h1 className="text-3xl font-semibold">
                                Incident #{signalement.id} {signalement.prenom} {signalement.nom}
                            </h1>
                        </div>

                        <div className="relative">
                            {(() => {
                                const displayStatus = getDisplayStatus(signalement.statut)
                                const statusStyle = statutsConfig[displayStatus as keyof typeof statutsConfig] || statutsConfig['En attente']
                                return (
                                    <button
                                        onClick={() => !isReadOnly && setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border font-['Montserrat'] font-medium text-sm min-w-[140px] justify-between transition-all ${isReadOnly ? 'cursor-default opacity-80' : ''}`}
                                        style={{
                                            backgroundColor: statusStyle.bgColor,
                                            color: statusStyle.textColor,
                                            borderColor: statusStyle.borderColor
                                        }}
                                    >
                                        {displayStatus}
                                        {!isReadOnly && <ChevronDownIcon className="w-4 h-4" />}
                                    </button>
                                )
                            })()}

                            {isStatusDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                    {statuts.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => handleStatusChange(s)}
                                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0 font-['Montserrat']"
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: statutsConfig[s as keyof typeof statutsConfig].dotColor }}
                                            />
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mb-8">
                        {signalement.types_signalement && (
                            <span className="px-3 py-1 rounded-sm bg-[#F5F3FF] text-[#8B5CF6] border border-[#DDD6FE] text-sm font-['Montserrat']">
                                {signalement.types_signalement.libelle}
                            </span>
                        )}
                    </div>

                    {/* Grid: Rappel & Lieu */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-2xl font-semibold font-['Poppins']">Rappel de l&apos;incident</h2>
                            </div>
                            <div className="bg-white rounded-[32px] shadow-sm p-8 min-h-[300px] relative border border-gray-50">
                                {isEditingRappel ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-['Poppins']">Titre</label>
                                            <input
                                                type="text"
                                                value={editedTitre}
                                                onChange={(e) => setEditedTitre(e.target.value)}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-lg font-semibold text-[#475569] font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#053F5C]/10"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-['Poppins']">Prénom</label>
                                                <input
                                                    type="text"
                                                    value={editedPrenom}
                                                    onChange={(e) => setEditedPrenom(e.target.value)}
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm text-[#475569] font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#053F5C]/10"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-['Poppins']">Nom</label>
                                                <input
                                                    type="text"
                                                    value={editedNom}
                                                    onChange={(e) => setEditedNom(e.target.value)}
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm text-[#475569] font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#053F5C]/10"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-['Poppins']">Téléphone</label>
                                                <input
                                                    type="text"
                                                    value={editedTelephone}
                                                    onChange={(e) => setEditedTelephone(e.target.value)}
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm text-[#475569] font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#053F5C]/10"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-['Poppins']">Email</label>
                                                <input
                                                    type="email"
                                                    value={editedEmail}
                                                    onChange={(e) => setEditedEmail(e.target.value)}
                                                    className="w-full p-2 border border-gray-200 rounded-lg text-sm text-[#475569] font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#053F5C]/10"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1 font-['Poppins']">Description</label>
                                            <textarea
                                                value={editedDescription}
                                                onChange={(e) => setEditedDescription(e.target.value)}
                                                rows={4}
                                                className="w-full p-2 border border-gray-200 rounded-lg text-sm text-[#242A35] font-['Montserrat'] focus:outline-none focus:ring-2 focus:ring-[#053F5C]/10 resize-none"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-3 pt-2">
                                            <button
                                                onClick={() => setIsEditingRappel(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={handleSaveRappel}
                                                disabled={isSavingRappel}
                                                className="px-6 py-2 bg-[#053F5C] text-white rounded-lg text-sm font-medium hover:bg-[#074d70] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {isSavingRappel ? (
                                                    <>
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        <span>Enregistrement...</span>
                                                    </>
                                                ) : (
                                                    'Enregistrer'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-semibold text-[#475569] mb-4 font-['Poppins']">{signalement.titre}</h3>

                                        <div className="flex items-center gap-4 mb-6 text-sm font-['Poppins']">
                                            {(() => {
                                                const displayStatus = getDisplayStatus(signalement.statut)
                                                const statusStyle = statutsConfig[displayStatus as keyof typeof statutsConfig] || statutsConfig['En attente']
                                                return (
                                                    <div className="flex items-center gap-1.5 font-medium" style={{ color: statusStyle.dotColor }}>
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusStyle.dotColor }} />
                                                        <span>{displayStatus}</span>
                                                    </div>
                                                )
                                            })()}
                                            <span className="text-[#64748B]">Déclarer le {formatDate(signalement.date_signalement)}</span>
                                            <span className="font-semibold">{signalement.prenom} {signalement.nom}</span>
                                        </div>

                                        <div className="mb-6">
                                            <p className="text-[#64748B] font-semibold mb-2 font-['Poppins']">Contact</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-[#475569] font-['Poppins']">
                                                <span>{signalement.telephone || '01 02 03 04 05'}</span>
                                                <span>{signalement.email || 'mail@gmail.com'}</span>
                                            </div>
                                        </div>

                                        <p className="text-[#242A35] text-sm leading-relaxed mb-8 font-['Montserrat']">
                                            {signalement.description}
                                        </p>

                                        {!isReadOnly && (
                                            <button
                                                onClick={() => setIsEditingRappel(true)}
                                                className="absolute bottom-8 right-8 p-2 text-[#053F5C] hover:bg-[#F5FCFE] rounded-lg transition-colors border border-transparent hover:border-gray-100"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-4 font-['Poppins']">Lieu de l&apos;incident</h2>
                            <div className="rounded-[32px] overflow-hidden shadow-sm h-[300px] relative border border-gray-100">
                                {signalement.latitude && signalement.longitude ? (
                                    <div className="w-full h-full">
                                        <IncidentMap
                                            center={[signalement.latitude, signalement.longitude]}
                                            zoom={15}
                                            markers={[{
                                                id: signalement.id.toString(),
                                                titre: signalement.titre,
                                                latitude: signalement.latitude,
                                                longitude: signalement.longitude,
                                                statut: signalement.statut
                                            }]}
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-50 flex items-center justify-between z-[400]">
                                            <div className="flex items-center gap-2 text-sm font-['Montserrat']">
                                                <svg className="w-6 h-6 text-[#053F5C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>{loadingAddress ? 'Chargement...' : (fullAddress || 'Chargement de l\'adresse...')}</span>
                                            </div>
                                            <button
                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                onClick={() => navigator.clipboard.writeText(fullAddress)}
                                            >
                                                <ClipboardIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400">
                                        Pas de localisation disponible
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Photos Section */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold mb-6 font-['Poppins']">Photos de l&apos;incident</h2>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                            {photos.length > 0 ? (
                                photos.map((photo: any, index: number) => (
                                    <div key={photo.id || index} className="w-[300px] h-[225px] flex-shrink-0 relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
                                        <Image
                                            src={getPublicUrlFromPath(photo.url)}
                                            alt={`Incident photo ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="w-[300px] h-[225px] flex-shrink-0 bg-gray-100 rounded-2xl animate-pulse" />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Intervention d'agent & Décisionnaire */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        {/* Intervention d'agent */}
                        <div id="intervention" className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold font-['Poppins']">Intervention d&apos;agent</h2>
                                {!isReadOnly && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsAgentDropdownOpen(!isAgentDropdownOpen)}
                                            className="flex items-center gap-2 px-4 py-1.5 border border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:bg-white hover:border-gray-300 transition-all font-['Poppins'] bg-transparent"
                                        >
                                            Attribuer un autre agent
                                            <ChevronDownIcon className="w-4 h-4" />
                                        </button>

                                        {isAgentDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                <div className="max-h-60 overflow-y-auto">
                                                    {agents && agents.length > 0 ? (
                                                        agents.map((agent: any) => (
                                                            <button
                                                                key={agent.id}
                                                                onClick={async () => {
                                                                    await handleAgentChange(agent);
                                                                }}
                                                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0 font-['Montserrat']"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xs font-bold">
                                                                    {agent.prenom[0]}{agent.nom[0]}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{agent.prenom} {agent.nom}</span>
                                                                    <span className="text-[10px] text-gray-500">{agent.email}</span>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-3 text-sm text-gray-500 font-['Montserrat']">
                                                            Aucun agent trouvé
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full border-2 border-orange-200 flex items-center justify-center p-1.5">
                                    <div className="w-full h-full rounded-full bg-orange-50 flex items-center justify-center text-[#FD8E1F]">
                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-1 font-['Poppins']">
                                    <p className="text-lg font-semibold">
                                        {(signalement as any).agent ? `${(signalement as any).agent.prenom} ${(signalement as any).agent.nom}` : 'Non attribué'}
                                    </p>
                                    <p className="text-sm">Mail: <span className="font-medium">{(signalement as any).agent?.email || '-'}</span></p>
                                    <p className="text-sm">tel : <span className="font-medium">{(signalement as any).agent?.phone_number || '-'}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Décisionnaire */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold font-['Poppins']">Décisionnaire</h2>
                                {!isReadOnly && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsDecisionnaireDropdownOpen(!isDecisionnaireDropdownOpen)}
                                            className="flex items-center gap-2 px-4 py-1.5 border border-[#E2E8F0] rounded-lg text-sm text-[#64748B] hover:bg-white hover:border-gray-300 transition-all font-['Poppins'] bg-transparent"
                                        >
                                            Attribuer un autre décisionnaire
                                            <ChevronDownIcon className="w-4 h-4" />
                                        </button>

                                        {isDecisionnaireDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                                <div className="max-h-60 overflow-y-auto">
                                                    {agents && agents.length > 0 ? (
                                                        agents.map((agent: any) => (
                                                            <button
                                                                key={agent.id}
                                                                onClick={async () => {
                                                                    await handleDecisionnaireChange(agent);
                                                                    setIsDecisionnaireDropdownOpen(false);
                                                                }}
                                                                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-50 last:border-0 font-['Montserrat']"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 text-xs font-bold">
                                                                    {agent.prenom[0]}{agent.nom[0]}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{agent.prenom} {agent.nom}</span>
                                                                    <span className="text-[10px] text-gray-500">{agent.email}</span>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-4 py-3 text-sm text-gray-500 font-['Montserrat']">
                                                            Aucun agent trouvé
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full border-2 border-orange-200 flex items-center justify-center p-1.5">
                                    <div className="w-full h-full rounded-full bg-orange-50 flex items-center justify-center text-[#FD8E1F]">
                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="space-y-1 font-['Poppins']">
                                    <p className="text-lg font-semibold">
                                        {(signalement as any).decisionnaire ? `${(signalement as any).decisionnaire.prenom} ${(signalement as any).decisionnaire.nom}` : 'Non validé'}
                                    </p>
                                    <p className="text-sm">Mail: <span className="font-medium">{(signalement as any).decisionnaire?.email || '-'}</span></p>
                                    <p className="text-sm">tel : <span className="font-medium">{(signalement as any).decisionnaire?.phone_number || '0606060660'}</span></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messagerie Section */}
                    <div className="bg-white rounded-[32px] shadow-sm p-10 flex flex-col border border-gray-50 mb-12">
                        <h2 className="text-2xl font-semibold mb-8 font-['Poppins']">Messagerie</h2>
                        <div className="flex-1 space-y-8 mb-8 overflow-y-auto max-h-[400px] pr-4 scrollbar-thin scrollbar-thumb-blue-100 scrollbar-track-transparent">
                            {suivis && suivis.length > 0 ? (
                                suivis.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0 border border-orange-100 font-bold text-sm">
                                            {item.auteur_nom ? (
                                                getMessageInitials(item.auteur_nom)
                                            ) : (
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm font-['Poppins']">{item.auteur_nom || 'Agent anonyme'}</span>
                                                    <span className="text-[11px] text-[#64748B] font-['Poppins']">
                                                        {formatDate(item.created_at)} {item.titre || 'Note interne'}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-[#475569] leading-relaxed font-['Montserrat'] whitespace-pre-wrap pr-12">
                                                {item.contenu}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center text-gray-400 font-['Montserrat']">
                                    Aucun message pour le moment.
                                </div>
                            )}
                        </div>

                        {!isReadOnly && (
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-semibold mb-4 font-['Poppins']">Ajouter une annotation</h3>
                                <div className="space-y-4">
                                    <textarea
                                        value={annotation}
                                        onChange={(e) => setAnnotation(e.target.value)}
                                        placeholder="Expliquez ce qui se passe avec le plus de détails possibles"
                                        className="w-full h-40 p-5 bg-white border border-[#E2E8F0] rounded-2xl text-sm focus:ring-2 focus:ring-[#053F5C] focus:border-transparent resize-none placeholder:text-gray-400 font-['Montserrat']"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSubmitAnnotation}
                                            disabled={isSubmittingAnnotation || !annotation.trim()}
                                            className="flex items-center gap-2 px-8 py-2.5 bg-[#E2E8F0] text-[#053F5C] rounded-lg font-semibold text-sm hover:bg-[#D1D9E6] transition-all font-['Poppins'] disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <span className="text-[#053F5C]">
                                                {isSubmittingAnnotation ? 'Envoi...' : 'Envoyer'}
                                            </span>
                                            <svg
                                                className={`w-4 h-4 text-[#053F5C] transition-transform group-hover:translate-x-1 ${isSubmittingAnnotation ? 'animate-pulse' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </RoleProtectedPage>
    )
}
