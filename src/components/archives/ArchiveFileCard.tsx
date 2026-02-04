'use client'

import React from 'react'
import { FiEye, FiTrash2, FiMaximize2 } from 'react-icons/fi'
import Button from '@/components/ui/Button'

export interface ArchiveFileData {
  id: string
  file: File
  titre: string
  numeroOfficiel: string
  auteur: string
  collectivite: string
  categorie: string
}

interface ArchiveFileCardProps {
  data: ArchiveFileData
  onUpdate: (id: string, field: keyof ArchiveFileData, value: string) => void
  onDelete: (id: string) => void
  onPreview: (file: File) => void
}

export function ArchiveFileCard({ data, onUpdate, onDelete, onPreview }: ArchiveFileCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-4 relative">
      {/* Circle Selection Indicator (Top Left) - Visual only for now based on screenshot */}
      <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full border border-green-500 bg-white flex items-center justify-center">
         {/* Green circle content if any, otherwise just border implies selection or status */}
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-[#0f1535] truncate max-w-[200px]" title={data.file.name}>
          {data.file.name}
        </h3>
        <Button 
          variant="outline" 
          size="xs"
          className="flex items-center gap-2 text-slate-600 border-slate-200 py-1"
          onClick={() => onPreview(data.file)}
        >
          <FiEye />
          Afficher
        </Button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Titre */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-400">Titre</label>
          <input 
            type="text"
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-[#0f1535] focus:outline-none focus:border-[#3b82f6]"
            placeholder="Titre de l'archive"
            value={data.titre}
            onChange={(e) => onUpdate(data.id, 'titre', e.target.value)}
          />
        </div>

        {/* Numéro officiel */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-400">Numéro officiel</label>
          <input 
            type="text"
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-[#0f1535] focus:outline-none focus:border-[#3b82f6]"
            placeholder="Ex: 315"
            value={data.numeroOfficiel}
            onChange={(e) => onUpdate(data.id, 'numeroOfficiel', e.target.value)}
          />
        </div>

        {/* Auteur */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-400">Auteur</label>
          <input 
            type="text"
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-[#0f1535] focus:outline-none focus:border-[#3b82f6]"
            placeholder="Ex: Maire"
            value={data.auteur}
            onChange={(e) => onUpdate(data.id, 'auteur', e.target.value)}
          />
        </div>

        {/* Collectivité concernée */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-400">Collectivité concernée</label>
          <input 
            type="text"
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-[#0f1535] focus:outline-none focus:border-[#3b82f6]"
            placeholder="Ex: Romorantin-Lanthenay"
            value={data.collectivite}
            onChange={(e) => onUpdate(data.id, 'collectivite', e.target.value)}
          />
        </div>

        {/* Catégorie */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-400">Catégorie</label>
          <div className="relative">
            <select 
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-[#0f1535] focus:outline-none focus:border-[#3b82f6] appearance-none bg-white"
              value={data.categorie}
              onChange={(e) => onUpdate(data.id, 'categorie', e.target.value)}
            >
              <option value="">Voirie</option>
              <option value="Securite">Sécurité publique</option>
              <option value="Environnement">Environnement</option>
              <option value="Sante">Santé publique</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Delete */}
      <div className="mt-2 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 text-slate-600 border-slate-200 hover:text-red-500 hover:border-red-200"
          onClick={() => onDelete(data.id)}
        >
          <FiTrash2 />
          Supprimer
        </Button>
      </div>
    </div>
  )
}
