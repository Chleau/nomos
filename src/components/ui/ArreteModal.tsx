'use client'

import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import RichTextEditor from './RichTextEditor'
import type { ArreteMunicipal } from '@/types/entities'

interface ArreteModalProps {
    isOpen: boolean
    onClose: () => void
    arrete: ArreteMunicipal | null
}

export const ArreteModal: React.FC<ArreteModalProps> = ({ isOpen, onClose, arrete }) => {
    if (!isOpen || !arrete) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col pointer-events-auto overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <span className="font-medium">{arrete.type || 'Arrêté'}</span>
                                {arrete.numero && (
                                    <>
                                        <span>•</span>
                                        <span>N° {arrete.numero}</span>
                                    </>
                                )}
                                {arrete.categorie && arrete.categorie !== 'Sans catégorie' && (
                                    <>
                                        <span>•</span>
                                        <span className="text-[#f27f09]">{arrete.categorie}</span>
                                    </>
                                )}
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {arrete.titre || 'Sans titre'}
                            </h2>
                            {arrete.date_creation && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Créé le {new Date(arrete.date_creation).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-[#f5fcfe]">
                        <div className="bg-white w-full max-w-[210mm] mx-auto shadow-sm rounded-lg overflow-hidden">
                            <RichTextEditor
                                value={arrete.contenu || '<p>Aucun contenu</p>'}
                                onChange={() => { }}
                                disabled={true}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ArreteModal
