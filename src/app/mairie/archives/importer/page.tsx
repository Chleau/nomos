'use client'

import React, { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RoleProtectedPage } from '@/components/auth/RoleProtectedPage'
import { UserRole } from '@/types/auth'
import Button from '@/components/ui/Button'
import { FiArrowLeft, FiDownload, FiFileText } from 'react-icons/fi'
import { ArchiveFileCard, ArchiveFileData } from '@/components/archives/ArchiveFileCard'

export default function ImportArchivesPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [files, setFiles] = useState<ArchiveFileData[]>([])
  const [importName, setImportName] = useState('')

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
      id: Math.random().toString(36).substr(2, 9),
      file,
      titre: file.name.split('.').slice(0, -1).join('.'), // Default title from filename
      numeroOfficiel: '',
      auteur: '',
      collectivite: '',
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

  return (
    <RoleProtectedPage allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MAIRIE]}>
      <div className="p-8 w-full max-w-[1600px] mx-auto space-y-6">
        
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
            <h1 className="text-[24px] font-bold text-[#0f1535] mb-6">Importer des archives</h1>
            
            <div 
              className={`
                w-full h-[300px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-8 transition-colors
                ${isDragging ? 'border-[#3b82f6] bg-blue-50' : 'border-[#9CA3AF] bg-[#F8FAFC]/50'}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="mb-4">
                 {/* Icon */}
                 <FiDownload className="text-[40px] text-[#64748b]" />
              </div>
              
              <p className="text-[#0f172a] font-medium mb-2">
                Glisser-déposer ou <span className="underline cursor-pointer" onClick={triggerFileInput}>cliquer pour importer</span>
              </p>
              
              <p className="text-[#64748b] text-sm max-w-[500px] mb-6">
                Téléchargez jusqu'à 6 fichiers (JPG, PNG, PDF, DOCX, XLSX, ZIP) d'une taille maximale de 10 Mo chacun.
              </p>

              <Button 
                variant="outline" 
                onClick={triggerFileInput}
                className="px-6 border-[#cbd5e1] text-[#0f172a] font-medium hover:bg-slate-50"
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
              {/* Import Name */}
              <div className="space-y-2">
                <label className="text-lg font-bold text-[#0f1535]">Nom de l'import</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Arrêtés entre le 24/05/2010 et le 24/05/2011" 
                    className="flex-1 border border-slate-200 rounded-md px-4 py-3 text-[#0f1535] focus:outline-none focus:border-[#e67e22] focus:ring-1 focus:ring-[#e67e22]"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                  />
                  <Button 
                    variant="orange" 
                    className="flex items-center gap-2 px-6 text-white font-medium"
                    onClick={() => console.log('Valider import', { importName, files })}
                  >
                    <FiFileText />
                    Valider l'importation
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
