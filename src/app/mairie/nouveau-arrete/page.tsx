'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { useCreateArrete, useRecentArretes, useArrete, useUpdateArrete } from '@/lib/hooks/useArretes'

import { ARRETE_CATEGORIES, type ArreteCategory } from '@/lib/constants'
import Button from '@/components/ui/Button'
import RichTextEditor from '@/components/ui/RichTextEditor'
import ArreteModal from '@/components/ui/ArreteModal'
import type { ArreteMunicipal } from '@/types/entities'
import {
    ArrowLeftIcon,
    ChevronDownIcon,
    SparklesIcon,
    // New icons for sidebar
    MagnifyingGlassIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    EllipsisVerticalIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    TrashIcon
} from '@heroicons/react/24/outline'

export default function NouveauArretePage() {
    const router = useRouter()
    const { user } = useSupabaseAuth()
    const { data: habitant } = useCurrentHabitant(user?.id || null)
    const createArrete = useCreateArrete()
    const updateArrete = useUpdateArrete()
    const { data: recentArretes } = useRecentArretes(habitant?.commune_id || null)

    const searchParams = useSearchParams()
    const arreteId = searchParams.get('id')
    const mode = searchParams.get('mode')
    const isReadOnly = mode === 'view'
    const { data: existingArrete, isLoading: loadingArrete, isError: isArreteError, refetch: refetchArrete } = useArrete(arreteId)

    // Form State
    const [title, setTitle] = useState('')
    const [numero, setNumero] = useState('')
    const [category, setCategory] = useState<string>('Sans catégorie')
    const [typeDocument, setTypeDocument] = useState<string>('Arrêté')
    const [content, setContent] = useState(`SERVICE : DIRECTION DU SECRETARIAT GENERAL ET DE L'OBSERVATOIRE

ARRÊTÉ : ${new Date().getFullYear()}-XXXX

OBJET : Taper l'objet du document ici...

Vu le Code du Travail...
Vu le Code Général des Collectivités Territoriales...

ARRETE
Article 1 : ...
`)
    const [prompt, setPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isActionsOpen, setIsActionsOpen] = useState(false)
    const [isTypeOpen, setIsTypeOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
    const [selectedArrete, setSelectedArrete] = useState<ArreteMunicipal | null>(null)

    // Indicateur de synchronisation avec la DB
    const [hasSyncedWithDb, setHasSyncedWithDb] = useState(false)

    // Reset de la synchro si l'ID dans l'URL change
    useEffect(() => {
        setHasSyncedWithDb(false)
        // Forcer le refetch quand on revient sur la page avec un ID
        if (arreteId) {
            refetchArrete()
        }
    }, [arreteId, refetchArrete])

    // Effet principal de chargement et synchronisation
    useEffect(() => {
        // Cas 1 : Modification d'un arrêté existant
        if (arreteId && existingArrete && !loadingArrete && !hasSyncedWithDb) {
            console.log('Synchronisation DB -> Editeur', existingArrete.id)

            setTitle(existingArrete.titre || '')
            setNumero(existingArrete.numero || '')
            setCategory(existingArrete.categorie || 'Sans catégorie')
            setTypeDocument(existingArrete.type || 'Arrêté')

            const contentToSet = existingArrete.contenu || ''
            console.log('📥 Contenu HTML chargé depuis la DB:', contentToSet)
            // Normalisation des sauts de ligne pour l'affichage HTML si ce n'est pas déjà du HTML
            if (contentToSet && !contentToSet.includes('<') && contentToSet.includes('\n')) {
                setContent(contentToSet.replace(/\n/g, '<br>'))
            } else {
                setContent(contentToSet)
            }

            setHasSyncedWithDb(true)
        }

        // Cas 2 : Création d'un nouvel arrêté (pas d'ID)
        else if (!arreteId && !hasSyncedWithDb) {
            console.log('Initialisation nouveau document')
            // Convertir le contenu par défaut en HTML
            setContent(content.replace(/\n/g, '<br>'))
            setHasSyncedWithDb(true)
        }
    }, [arreteId, existingArrete, loadingArrete, hasSyncedWithDb])

    // Actions Handlers
    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${title || 'nouveau-document'}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share({
                    title: title || 'Nouveau document',
                    text: content.substring(0, 100) + '...',
                    url: window.location.href
                })
            } catch (err) {
                console.error(err)
            }
        } else {
            await navigator.clipboard.writeText(window.location.href)
            alert('Lien copié dans le presse-papier !')
        }
    }

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce brouillon ? Toutes les données seront perdues.')) {
            setTitle('')
            setCategory('Sans catégorie')
            setTypeDocument('Arrêté')
            setContent('')
        }
    }

    const categories = ARRETE_CATEGORIES

    const typesDocument = [
        'Arrêté',
        'Délibération',
        'Décision'
    ]

    const handleSave = async () => {
        if (!habitant?.commune_id || !title) return

        setSaveStatus('saving')

        try {
            if (arreteId) {
                console.log('Updating arrete:', arreteId)
                console.log('📝 Contenu HTML à enregistrer:', content)
                const updateData = {
                    titre: title,
                    numero: numero,
                    contenu: content,
                    categorie: category as ArreteCategory,
                    type: typeDocument,
                    date_modification: new Date().toISOString()
                }
                console.log('Update payload:', updateData)

                // Ensure ID is passed as number if possible for strict DB consistency
                const idToUpdate = !isNaN(Number(arreteId)) ? Number(arreteId) : arreteId

                const result = await updateArrete.mutateAsync({
                    id: idToUpdate,
                    updates: updateData
                })
                console.log('Update result:', result)

                // Forcer le refetch pour mettre à jour les données
                await refetchArrete()

                setSaveStatus('success')
                setTimeout(() => setSaveStatus('idle'), 3000)
            } else {
                console.log('📝 Contenu HTML à enregistrer (création):', content)

                console.log('Sending arrete data...', {
                    titre: title,
                    contenu: content,
                    commune_id: habitant.commune_id,
                    agent_id: habitant.id,
                    statut: 'Brouillon',
                    categorie: category,
                    type: typeDocument
                })

                const result = await createArrete.mutateAsync({
                    titre: title,
                    numero: numero,
                    contenu: content,
                    commune_id: habitant.commune_id,
                    agent_id: habitant.id,
                    statut: 'Brouillon', // Décommenter si la colonne existe
                    categorie: category as ArreteCategory,
                    type: typeDocument,
                    date_creation: new Date().toISOString(),
                    archive: false
                })

                console.log('Arrêté créé avec succès:', result)

                // Mettre à jour l'URL avec l'ID du nouvel arrêté
                if (result && result.id) {
                    router.push(`/mairie/nouveau-arrete?id=${result.id}`, { scroll: false })
                    // Attendre que l'URL soit mise à jour puis refetch
                    await new Promise(resolve => setTimeout(resolve, 100))
                    await refetchArrete()
                }

                setSaveStatus('success')
                setTimeout(() => setSaveStatus('idle'), 3000)
            }
        } catch (error) {
            console.error('Erreur lors de la création de l\'arrêté:', error)
            setSaveStatus('error')
            setTimeout(() => setSaveStatus('idle'), 3000)
            alert("Une erreur est survenue lors de l'enregistrement. Vérifiez la console pour plus de détails.")
        }
    }

    const handleGenerate = () => {
        if (!prompt) return
        setIsGenerating(true)
        // Simulation of AI generation
        setTimeout(() => {
            const newText = `\n\n[Texte généré pour : "${prompt}"]\nConsidérant que...`
            const newHtml = newText.replace(/\n/g, '<br>')

            setContent(prev => prev + newHtml)

            setPrompt('')
            setIsGenerating(false)
        }, 1500)
    }

    // Sidebar Card Component
    const SidebarCard = ({
        number,
        title,
        date,
        arrete,
        onClick
    }: {
        number: string,
        title: string,
        date: string,
        arrete: ArreteMunicipal,
        onClick: () => void
    }) => (
        <div
            className="bg-white border border-[#e7eaed] rounded-3xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
            onClick={onClick}
        >
            <div className="flex flex-col gap-2">
                <p className="text-[#242a35] underline font-medium font-['Poppins']">{number}</p>
                <p className="text-[#242a35] font-normal leading-tight line-clamp-2">{title}</p>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-[#242a35]">{date}</span>
                <span className="text-[#f27f09] font-medium">Consulter</span>
            </div>
        </div>
    )

    return (
        <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
            <div className="flex h-[calc(100vh-64px)] bg-[#f5fcfe] overflow-hidden">

                {/* CENTER: Main Editor Area */}
                <div className="flex-1 flex flex-col h-full min-w-0 relative z-10 transition-all duration-300">
                    {/* Header / Toolbar */}
                    <div className="bg-white px-6 py-3 flex items-center gap-4 shrink-0 z-30 shadow-sm">
                        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>

                        {isArreteError && (
                            <div className="text-red-500 text-sm flex items-center gap-2">
                                Erreur de chargement
                                <Button size="xs" variant="outline" onClick={() => refetchArrete()}>Réessayer</Button>
                            </div>
                        )}

                        <div className="flex-1 flex items-center gap-4">
                            <div className="w-64 relative group border border-[#e7eaed] rounded px-3 py-1">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold absolute -top-2 left-2 bg-white px-1 tracking-wider">N°</span>
                                <input
                                    type="text"
                                    placeholder="Ex: 2024-001"
                                    className="w-full text-base text-gray-800 placeholder:text-gray-300 border-none focus:ring-0 p-0 font-mono bg-transparent transition-all disabled:opacity-50"
                                    value={numero}
                                    onChange={(e) => setNumero(e.target.value)}
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Type Document Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => !isReadOnly && setIsTypeOpen(!isTypeOpen)}
                                    className={`flex items-center gap-2 px-3 py-1.5 border border-[#e7eaed] rounded-lg bg-white text-gray-600 transition-colors ${!isReadOnly ? 'hover:bg-gray-50' : 'opacity-70 cursor-default'}`}
                                >
                                    <span className="text-sm">{typeDocument}</span>
                                    {!isReadOnly && <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                                </button>
                                {isTypeOpen && !isReadOnly && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsTypeOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-100 shadow-lg rounded-md p-1 z-50">
                                            {typesDocument.map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => { setTypeDocument(t); setIsTypeOpen(false) }}
                                                    className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-50 text-gray-700"
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Category Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => !isReadOnly && setIsCategoryOpen(!isCategoryOpen)}
                                    className={`flex items-center gap-2 px-3 py-1.5 border border-[#e7eaed] rounded-lg bg-white text-gray-600 transition-colors ${!isReadOnly ? 'hover:bg-gray-50' : 'opacity-70 cursor-default'}`}
                                >
                                    <span className="text-sm truncate max-w-[120px]">{category}</span>
                                    {!isReadOnly && <ChevronDownIcon className="w-4 h-4 text-gray-400" />}
                                </button>
                                {isCategoryOpen && !isReadOnly && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-100 shadow-lg rounded-md p-1 z-50 max-h-[300px] overflow-y-auto">
                                            {categories.map(c => (
                                                <button
                                                    key={c}
                                                    onClick={() => { setCategory(c); setIsCategoryOpen(false) }}
                                                    className="block w-full text-left px-3 py-1 text-sm hover:bg-gray-50 text-gray-700"
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Actions Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                                    className="flex items-center justify-center w-9 h-9 border border-[#e7eaed] rounded-lg bg-[#dfe4ea] text-gray-600 hover:bg-gray-200 transition-colors"
                                >
                                    <EllipsisVerticalIcon className="w-5 h-5 text-gray-600" />
                                </button>

                                {isActionsOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsActionsOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl p-1.5 z-50">
                                            <button onClick={() => { handleDownload(); setIsActionsOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg text-left">
                                                <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                                                Télécharger
                                            </button>
                                            <button onClick={() => { handleShare(); setIsActionsOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg text-left">
                                                <ShareIcon className="w-4 h-4 text-gray-500" />
                                                Partager
                                            </button>
                                            {!isReadOnly && (
                                                <>
                                                    <div className="h-px bg-gray-100 my-1"></div>
                                                    <button onClick={() => { handleDelete(); setIsActionsOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg text-left">
                                                        <TrashIcon className="w-4 h-4" />
                                                        Supprimer
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Primary Action */}
                            {!isReadOnly && (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="bg-[#f27f09] hover:bg-[#d67008] text-white border-transparent"
                                    onClick={handleSave}
                                    disabled={createArrete.isPending || updateArrete.isPending || saveStatus === 'saving'}
                                >
                                    {saveStatus === 'saving' ? 'Enregistrement...' : saveStatus === 'success' ? '✓ Enregistré' : 'Enregistrer'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Title Bar (Moved from Header) */}
                    <div className="bg-white border-b border-[#e7eaed] px-6 py-4 flex flex-col gap-1 shrink-0 z-20">
                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wide">Objet</label>
                        <input
                            type="text"
                            placeholder="Saisissez l'objet du document ici..."
                            className="w-full text-xl text-gray-800 placeholder:text-gray-300 border-none focus:ring-0 p-0 font-medium bg-transparent disabled:opacity-70"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isReadOnly}
                            readOnly={isReadOnly}
                        />
                    </div>

                    {/* Document Content (Scrollable) */}
                    <div className="flex-1 overflow-y-auto bg-[#f5fcfe] pt-8 pb-0 px-8 flex flex-col items-center relative scroll-smooth">
                        <div className="bg-white w-[210mm] min-h-[297mm] h-auto shadow-sm shrink-0 mb-12">
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                disabled={isReadOnly}
                                placeholder="Commencez à rédiger votre arrêté..."
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* AI Prompt Section (Bottom) */}
                    {!isReadOnly && (
                        <div className="bg-white p-0 shrink-0 z-30 w-full border-t border-[#e2e8f0] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-6 w-full max-w-[210mm] mx-auto px-6 py-4">
                                <div className="flex-1 flex flex-col gap-1.5">
                                    <label className="text-[#053f5c] font-semibold text-sm flex items-center gap-2 font-['Poppins']">
                                        <SparklesIcon className="w-4 h-4 text-[#f27f09]" />
                                        Aidez-vous de l&apos;IA pour rédiger votre arrêté
                                    </label>
                                    <div className="bg-[#f8fafc] rounded-xl flex items-center px-4 py-2 gap-3 border border-[#e2e8f0] focus-within:border-[#f27f09] focus-within:ring-2 focus-within:ring-[#f27f09]/10 transition-all">
                                        <input
                                            type="text"
                                            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 font-['Montserrat']"
                                            placeholder="Rédige un arrêté sur l’ouverture des commerces..."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                        />
                                    </div>
                                </div>
                                <div className="self-end pb-0.5">
                                    <Button
                                        variant="primary"
                                        size="md"
                                        className="bg-[#f27f09] hover:bg-[#d67008] text-white border-transparent h-[42px] px-8 text-sm rounded-xl font-medium font-['Poppins'] transition-all shadow-md active:scale-95"
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? 'Génération...' : 'Générer'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: Context Sidebar */}
                {!isReadOnly && (
                    <div className={`${isSidebarOpen ? 'w-[400px]' : 'w-[48px]'} bg-[#f5fcfe] border-l border-[#e7eaed] flex flex-col transition-all duration-300 relative z-20 shrink-0`}>
                        <div className="p-2 flex justify-start">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                title={isSidebarOpen ? "Fermer le panneau" : "Ouvrir le panneau"}
                            >
                                {isSidebarOpen ? <ChevronRightIcon className="w-6 h-6" /> : <ChevronLeftIcon className="w-6 h-6" />}
                            </button>
                        </div>

                        {isSidebarOpen && (
                            <div className="flex-1 flex flex-col p-4 gap-6 overflow-y-auto w-[400px]"> {/* Fixed width inner container to prevent squish during transition */}
                                {/* Search */}
                                <div className="bg-white border border-[#dcdde0] rounded-xl p-3 flex items-center gap-2 shadow-sm">
                                    <MagnifyingGlassIcon className="w-6 h-6 text-[#8c8f97]" />
                                    <input
                                        placeholder="Rechercher..."
                                        className="w-full border-none outline-none text-sm text-[#8c8f97] placeholder:text-[#8c8f97]"
                                    />
                                </div>

                                {/* Cards List */}
                                <div className="flex flex-col gap-3">
                                    {recentArretes?.map((arrete) => (
                                        <SidebarCard
                                            key={arrete.id}
                                            number={`${arrete.type || 'Arrêté'} n° ${arrete.numero || '#' + arrete.id}`}
                                            title={arrete.titre || 'Sans titre'}
                                            date={new Date(arrete.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            arrete={arrete}
                                            onClick={() => setSelectedArrete(arrete)}
                                        />
                                    ))}
                                    {(!recentArretes || recentArretes.length === 0) && (
                                        <p className="text-center text-gray-400 py-4 italic">Aucun document récent</p>
                                    )}
                                </div>

                                {/* Pagination Mockup */}
                                <div className="flex justify-center gap-2 mt-4 pb-4">
                                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#e7eaed] bg-white text-gray-400 disabled:opacity-50" disabled>
                                        <ChevronLeftIcon className="w-4 h-4" />
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#e7eaed] bg-[#f27f09] text-white">1</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#e7eaed] bg-white text-gray-600">2</button>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#e7eaed] bg-white text-gray-600">3</button>
                                    <span className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
                                    <button className="w-8 h-8 flex items-center justify-center rounded-md border border-[#e7eaed] bg-white text-gray-400">
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Modal de consultation */}
            <ArreteModal
                isOpen={!!selectedArrete}
                onClose={() => setSelectedArrete(null)}
                arrete={selectedArrete}
            />
        </RoleProtectedPage>
    )
}
