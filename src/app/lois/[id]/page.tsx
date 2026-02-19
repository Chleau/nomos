'use client'

import { useParams, useRouter } from 'next/navigation'
import { useLoiById } from '@/lib/hooks/useLois'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import AlertBanner from '@/components/compte/AlertBanner'
import { useMemo } from 'react'

interface Article {
  title: string
  content: string
}

interface InfoSection {
  title: string
  content: string
}

interface SignatureSection {
  title: string
  content: string
}

export default function LoiDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: loi, isLoading, error } = useLoiById(parseInt(id))

  // Parser le contenu pour extraire les articles
  const articles: Article[] = useMemo(() => {
    if (!loi?.contenu) return []

    const articleRegex = /Article\s+\d+/gi
    const matches = [...loi.contenu.matchAll(articleRegex)]

    if (matches.length === 0) return []

    const infoRegex = /Informations\s+pratiques/i
    const infoMatch = loi.contenu.match(infoRegex)
    const infoIndex = infoMatch ? loi.contenu.indexOf(infoMatch[0]) : loi.contenu.length

    const signatureRegex = /Fait\s+à\s+/i
    const signatureMatch = loi.contenu.match(signatureRegex)
    const signatureIndex = signatureMatch ? loi.contenu.indexOf(signatureMatch[0]) : loi.contenu.length

    const parsedArticles: Article[] = []

    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i]
      const nextMatch = matches[i + 1]

      const startIndex = currentMatch.index!
      const endIndex = Math.min(
        nextMatch ? nextMatch.index! : loi.contenu.length,
        infoIndex,
        signatureIndex
      )

      const articleText = loi.contenu.substring(startIndex, endIndex).trim()
      const lines = articleText.split('\n')
      const title = lines[0]
      const content = lines.slice(1).join('\n').trim()

      parsedArticles.push({
        title,
        content
      })
    }

    return parsedArticles
  }, [loi])

  // Parser le contenu pour extraire la section informations pratiques
  const infoSection: InfoSection | null = useMemo(() => {
    if (!loi?.contenu) return null

    const infoRegex = /Informations\s+pratiques/i
    const match = loi.contenu.match(infoRegex)

    if (!match) return null

    const title = "Informations pratiques"
    const startIndex = loi.contenu.indexOf(match[0])
    const content = loi.contenu.substring(startIndex + match[0].length).trim()

    return {
      title,
      content
    }
  }, [loi])

  // Parser le contenu pour extraire la section signature (Fait à ...)
  const signatureSection: SignatureSection | null = useMemo(() => {
    if (!loi?.contenu) return null

    const signatureRegex = /Fait\s+à\s+[^,]+,\s+le\s+[^\n]+/i
    const match = loi.contenu.match(signatureRegex)

    if (!match) return null

    const title = match[0]
    const startIndex = loi.contenu.indexOf(match[0])
    const infoRegex = /Informations\s+pratiques/i
    const infoMatch = loi.contenu.match(infoRegex)
    const infoIndex = infoMatch ? loi.contenu.indexOf(infoMatch[0]) : loi.contenu.length

    const afterTitle = loi.contenu.substring(startIndex + match[0].length, infoIndex).trim()
    const content = afterTitle.split('\n').join('\n').trim()

    return {
      title,
      content
    }
  }, [loi])

  if (isLoading) {
    return (
      <div className="bg-[#f5fcfe] min-h-screen">
        <div className="container px-12 py-8">
          <p className="text-gray-500">Chargement de la loi...</p>
        </div>
      </div>
    )
  }

  if (error || !loi) {
    return (
      <div className="bg-[#f5fcfe] min-h-screen">
        <div className="container px-12 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#F27F09] mb-6 hover:text-[#d66d07] transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            Retour
          </button>
          <p className="text-red-500">Erreur lors du chargement de la loi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f5fcfe] min-h-screen pb-10 md:pb-6">
      <div className="flex flex-col">
        {/* Alert Banner */}
        <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />
      </div>
      <div className="container px-2.5 md:px-12 py-4 md:py-8">
        {/* Bouton retour */}
        <button
          onClick={() => router.back()}
          className="flex items-center w-[101px] h-[37px] gap-2 px-4 py-2 bg-transparent border border-[#64748B] text-[#053F5C] text-[14px] font-[Poppins] text-md rounded-md hover:bg-[#D9F5FB] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          retour
        </button>

        {/* Contenu principal */}
        <div className="">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="font-['Poppins'] font-semibold text-xl md:text-[36px] mt-6 mb-6">
              {loi.titre}
            </h1>
          </div>

          {/* Contenu */}
          <div className="flex flex-col gap-6">
            {articles.length > 0 ? (
              articles.map((article, index) => (
                <div key={index} className="flex flex-col gap-[14px]">
                  <h2 className="font-['Poppins'] font-medium text-lg md:text-[30px] text-[#242A35]">
                    {article.title}
                  </h2>
                  <div className="whitespace-pre-wrap text-[#242A35] font-['Montserrat'] font-normal text-base md:text-[18px]">
                    {article.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="whitespace-pre-wrap text-gray-700 font-['Montserrat'] text-[15px] leading-relaxed">
                {loi.contenu}
              </div>
            )}
          </div>

          {/* Section Signature */}
          {signatureSection && (
            <div className="flex flex-col mt-6 gap-6">
              <h2 className="font-['Poppins'] font-medium text-lg md:text-[30px] text-[#242A35]">
                {signatureSection.title}
              </h2>
              <div className="whitespace-pre-wrap text-[#242A35] font-['Montserrat'] font-normal text-base md:text-[18px]">
                {signatureSection.content}
              </div>
            </div>
          )}

          {/* Section Informations Pratiques */}
          {infoSection && (
            <div className="flex flex-col mt-6 mb-6 gap-6">
              <h2 className="font-['Poppins'] font-medium text-lg md:text-[30px] text-[#242A35]">
                {infoSection.title}
              </h2>
              <div className="whitespace-pre-wrap text-[#242A35] font-['Montserrat'] font-normal text-base md:text-[18px]">
                {infoSection.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
