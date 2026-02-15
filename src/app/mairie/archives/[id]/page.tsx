'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { useArrete, useUpdateArrete } from '@/lib/hooks/useArretes'
import { ARRETE_CATEGORIES } from '@/lib/constants'
import Button from '@/components/ui/Button'
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export default function ArchiveDetailPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params.id as string
    const mode = searchParams.get('mode') || 'view'
    const isReadOnly = mode === 'view'
    // When 'edit', only title/category/number are editable. 
    // Content is always read-only per user request ("on ne doit pas pouvoir modifier le contenu")

    const { user } = useSupabaseAuth()
    const { data: habitant } = useCurrentHabitant(user?.id || null)
    const { data: arrete, isLoading } = useArrete(id)
    const updateArrete = useUpdateArrete()

    // Form states
    const [titre, setTitre] = useState('')
    const [numero, setNumero] = useState('')
    const [auteur, setAuteur] = useState('Maire')
    const [categorie, setCategorie] = useState('Sans catégorie')
    const [contenu, setContenu] = useState('')
    const [collectivite, setCollectivite] = useState('')
    const [fichierUrl, setFichierUrl] = useState<string | null>(null)

    useEffect(() => {
        if (arrete) {
            setTitre(arrete.titre || '')
            setNumero(arrete.numero || '')
            setCategorie(arrete.categorie || 'Sans catégorie')
            setContenu(arrete.contenu || '')
            setAuteur('Maire')
            // setCollectivite(habitant?.commune?.nom || '')
            setFichierUrl(arrete.fichier_url || null)
        }
    }, [arrete, habitant])

    const handleSave = async () => {
        if (!id) return
        try {
            await updateArrete.mutateAsync({
                id,
                updates: {
                    titre,
                    numero,
                    categorie: categorie as any,
                    // contenu: contenu // Content is not updated
                }
            })
            router.push('/mairie/archives')
        } catch (error) {
            console.error("Failed to save", error)
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Chargement...</div>
    }

    // Common input styles matching the design: clean, white bg, subtle border
    const inputBaseStyle = "w-full rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm text-[#242a35] placeholder-gray-300 focus:border-[#f27f09] focus:ring-1 focus:ring-[#f27f09] disabled:bg-gray-50/50 disabled:text-gray-500 transition-all font-medium"
    const labelStyle = "block text-[16px] font-medium text-[#1f4e5f] font-['Poppins']"

    return (
        <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
            <div className="min-h-screen bg-[#f5fcfe] p-12">
                <div className="max-w-[1400px] mx-auto space-y-6">

                    {/* Header row with Back button */}
                    <div className="flex justify-between items-center">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            retour
                        </Button>
                    </div>

                    {/* Form Fields Row */}
                    <div className="grid grid-cols-12 gap-6 items-start">

                        {/* Colonne 1: Titre (Large) */}
                        <div className="col-span-12 xl:col-span-4 lg:col-span-3">
                            <label className={labelStyle}>Titre</label>
                            <input
                                type="text"
                                disabled={isReadOnly}
                                value={titre}
                                onChange={(e) => setTitre(e.target.value)}
                                className={inputBaseStyle}
                                placeholder="Titre de l'arrêté"
                            />
                        </div>

                        {/* Colonne 2: Numéro officiel (Small) */}
                        <div className="col-span-6 xl:col-span-2 lg:col-span-2">
                            <label className={labelStyle}>Numéro officiel</label>
                            <input
                                type="text"
                                disabled={isReadOnly}
                                value={numero}
                                onChange={(e) => setNumero(e.target.value)}
                                className={inputBaseStyle}
                            />
                        </div>

                        {/* Colonne 3: Auteur (Small) */}
                        <div className="col-span-6 xl:col-span-2 lg:col-span-2">
                            <label className={labelStyle}>Auteur</label>
                            <input
                                type="text"
                                disabled={true}
                                value={auteur}
                                className={`${inputBaseStyle} !bg-gray-50/50`}
                            />
                        </div>

                        {/* Colonne 4: Collectivité (Medium) */}
                        <div className="col-span-6 xl:col-span-2 lg:col-span-2">
                            <label className={labelStyle}>Collectivité concernée</label>
                            <input
                                type="text"
                                disabled={true}
                                value={collectivite}
                                className={`${inputBaseStyle} !bg-gray-50/50`}
                            />
                        </div>

                        {/* Colonne 5: Catégorie (Medium) */}
                        <div className="col-span-6 xl:col-span-2 lg:col-span-3">
                            <label className={labelStyle}>Catégorie</label>
                            <div className="relative">
                                <select
                                    disabled={isReadOnly}
                                    value={categorie}
                                    onChange={(e) => setCategorie(e.target.value)}
                                    className={`${inputBaseStyle} appearance-none pr-8`}
                                >
                                    <option value=""> Sélectionner </option>
                                    {ARRETE_CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        {/* Bouton Enregistrer row */}
                        {!isReadOnly && (
                            <div className="col-span-12 flex justify-end mt-8">
                                <Button
                                    className="bg-[#f27f09] hover:bg-[#d35400] text-white px-8 py-2.5 rounded-lg font-medium shadow-sm transition-all hover:shadow text-sm"
                                    onClick={handleSave}
                                >
                                    Enregistrer
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="bg-white rounded-2xl p-6 md:p-12 shadow-sm border border-gray-100 min-h-[500px]">
                        {fichierUrl ? (
                            <div className="w-full h-[800px] flex flex-col items-center justify-center">
                                <object
                                    data={fichierUrl}
                                    type="application/pdf"
                                    width="100%"
                                    height="100%"
                                    className="rounded-lg border border-gray-200"
                                >
                                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600 mb-4">Ce fichier ne peut pas être affiché directement.</p>
                                        <a
                                            href={fichierUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#f27f09] hover:underline font-medium"
                                        >
                                            Télécharger le fichier
                                        </a>
                                    </div>
                                </object>
                            </div>
                        ) : (
                            <div
                                className="prose max-w-none text-[#242a35] font-['Poppins'] whitespace-pre-wrap leading-relaxed font-normal"
                                dangerouslySetInnerHTML={{ __html: contenu }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </RoleProtectedPage>
    )
}
