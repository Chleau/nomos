'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import Button from '@/components/ui/Button'
import { FiArrowLeft } from 'react-icons/fi'
import { ArrowDownOnSquareIcon, DocumentCheckIcon, CheckIcon } from '@heroicons/react/24/outline'
import { ArchiveFileCard, ArchiveFileData } from '@/components/archives/ArchiveFileCard'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { useCurrentHabitant } from '@/lib/hooks/useHabitants'
import { useCommune } from '@/lib/hooks/useCommunes'
import { useCreateArrete } from '@/lib/hooks/useArretes'
import { agentsService } from '@/lib/services/agents.service'
import { uploadArreteFile, getArreteFileUrl } from '@/lib/services/storage.service'
import type { ArreteCategory } from '@/lib/constants'

export default function ImportArchivesPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<ArchiveFileData[]>([])
  const [importName, setImportName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auth & user data
  const { user } = useSupabaseAuth()
  const { data: habitant } = useCurrentHabitant(user?.id || null)
  const { data: commune } = useCommune(habitant?.commune_id || null)
  const createArrete = useCreateArrete()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return

    const newFiles: ArchiveFileData[] = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      titre: file.name.split('.').slice(0, -1).join('.'), // Default title from filename
      numeroOfficiel: '',
      auteur: habitant ? `${habitant.prenom} ${habitant.nom}` : '',
      collectivite: commune?.nom || '',
      categorie: ''
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    processFiles(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
    // Reset input to allow selecting same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const handleUpdateFile = (id: string, field: keyof ArchiveFileData, value: string) => {
    setFiles((prev) => prev.map(f => f.id === id ? { ...f, [field]: value } : f))
  }

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter(f => f.id !== id))
  }

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file)
    window.open(url, '_blank')
  }

  const handleSubmitImport = async () => {
    if (!habitant?.commune_id) {
      setError("Impossible de récupérer votre commune. Veuillez vous reconnecter.")
      return
    }

    if (!importName.trim()) {
      setError("Veuillez saisir un nom pour cet import.")
      return
    }

    if (files.length === 0) {
      setError("Veuillez ajouter au moins un fichier.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Get or create agent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: agent, error: agentError } = await agentsService.getOrCreateAgentFromHabitant(habitant as any)

      if (agentError || !agent) {
        throw new Error("Impossible de récupérer le profil agent. Vérifiez vos droits.")
      }

      // 2. Process each file
      for (const fileData of files) {
        // 2a. Upload file to storage
        const filePath = await uploadArreteFile(fileData.file, habitant.commune_id)
        const fileUrl = getArreteFileUrl(filePath)

        // 2b. Create arrete entry
        await createArrete.mutateAsync({
          commune_id: habitant.commune_id,
          agent_id: agent.id,
          titre: fileData.titre || fileData.file.name,
          contenu: '', // Archives importées n'ont pas de contenu texte directement
          categorie: (fileData.categorie || 'Sans catégorie') as ArreteCategory,
          fichier_url: fileUrl,
          numero: fileData.numeroOfficiel || undefined,
          statut: 'Archivé',
          archive: true,
          import_name: importName.trim()
        })
      }

      // 3. Success - show modal
      setIsSuccess(true)
    } catch (err) {
      console.error('Erreur lors de l\'import:', err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'import.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFiles([])
    setImportName('')
    setError(null)
    setIsSuccess(false)
  }

  return (
    <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-12 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-200">
            <div className="space-y-2 mb-10">
              <h2 className="text-[30px] font-['Poppins']  font-semibold text-gray-800">
                Vos documents ont été correctement importés
              </h2>
              <p className="text-lg text-gray-500">
                Vous pouvez les retrouver dans votre espace
              </p>
            </div>
            <div className="rounded-full bg-green-500 p-6 shadow-sm">
              <CheckIcon className="w-20 h-20 text-white stroke-[2.5]" />
            </div>

            <div className="flex items-center gap-4 w-full justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/mairie/archives')}
                className="min-w-[140px] border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Retour
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={resetForm}
                className="bg-[#e67e22] hover:bg-[#d35400] text-white min-w-[200px]"
              >
                Importer de nouveaux documents
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-12 w-full max-w-[1600px] mx-auto space-y-6">

        {/* Back Button */}
        <div>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#0f172a] border-[#e2e8f0] px-4 py-2 hover:bg-slate-50"
          >
            <FiArrowLeft />
            retour
          </Button>
        </div>

        <div className="space-y-8">
          <section>
            <h1 className="text-[20px] font-medium font-['Poppins'] text-[#0f1535] mb-2">Importer des archives</h1>

            <div
              className={`
                w-full h-[300px] border-2 border-dashed rounded-md flex flex-col items-center justify-center text-center p-8 transition-colors
                ${isDragging ? 'border-[#3b82f6] bg-blue-50' : 'border-[#9CA3AF] bg-[#F8FAFC]/50'}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                {/* Icon */}
                <ArrowDownOnSquareIcon className="w-10 h-10 text-[#64748b]" />
              </div>

              <p className="text-[#0f172a] font-medium mb-2">
                Glisser-déposer ou <span className="underline cursor-pointer" onClick={triggerFileInput}>cliquer pour importer</span>
              </p>

              <p className="text-[#64748b] text-sm max-w-[500px] mb-6">
                Téléchargez jusqu&apos;à 6 fichiers (JPG, PNG, PDF, DOCX, XLSX, ZIP) d&apos;une taille maximale de 10 Mo chacun.
              </p>

              <Button
                size='xs'
                variant="outline"
                onClick={triggerFileInput}
                className=""
              >
                Choisir les fichiers
              </Button>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileSelect}
                accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx,.zip"
              />
            </div>
          </section>

          {/* Imported Files Section */}
          {files.length > 0 && (
            <section className="space-y-6 animate-in fade-in duration-500">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Import Name */}
              <div className="space-y-2">

                <label className="text-[18px] font-medium font-['Poppins'] text-[#0f1535] mb-4">Nom de l&apos;import</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Arrêtés entre le 24/05/2010 et le 24/05/2011"
                    className="flex-1 border border-slate-200 rounded-md px-4 py-3 text-[#0f1535] focus:outline-none focus:border-[#e67e22] focus:ring-1 focus:ring-[#e67e22]"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <Button
                    variant="primary"
                    className="flex items-center gap-2 px-6 text-black font-medium"
                    onClick={handleSubmitImport}
                    disabled={isSubmitting}
                  >
                    <DocumentCheckIcon className="w-4 h-4" />
                    {isSubmitting ? 'Importation en cours...' : 'Valider l\'importation'}
                  </Button>
                </div>
              </div>

              {/* Files Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file) => (
                  <ArchiveFileCard
                    key={file.id}
                    data={file}
                    onUpdate={handleUpdateFile}
                    onDelete={handleDeleteFile}
                    onPreview={handlePreview}
                  />
                ))}
              </div>
            </section>
          )}

        </div>

      </div>
    </RoleProtectedPage>
  )
}
