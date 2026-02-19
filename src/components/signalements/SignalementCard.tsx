'use client'

interface SignalementCardProps {
  titre: string
  statut: 'En cours' | 'Résolu' | 'Signalé'
  date: string
  auteur: string
  description: string
  coordonnees?: string
  imageUrl?: string
  onClick?: () => void
  backgroundColor?: string
}

export default function SignalementCard({
  titre,
  statut,
  date,
  auteur,
  description,
  coordonnees,
  imageUrl,
  onClick,
  backgroundColor = 'bg-white'
}: SignalementCardProps) {
  const getStatutColor = () => {
    switch (statut) {
      case 'En cours':
        return 'text-gray-600'
      case 'Résolu':
        return 'text-green-600'
      case 'Signalé':
        return 'text-gray-700'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div
      onClick={onClick}
      className={`${backgroundColor} rounded-2xl md:rounded-3xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow h-[160px] md:h-[200px]`}
    >
      <div className="flex h-full">
        {/* Image à gauche */}
        <div className="w-[120px] md:w-[160px] h-[160px] md:h-[200px] bg-gray-600 flex-shrink-0 relative rounded-l-2xl md:rounded-l-3xl">
          {imageUrl ? (
            <img src={imageUrl} alt={titre} className="w-full h-full object-cover rounded-l-2xl md:rounded-l-3xl" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="md:w-10 md:h-10">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Contenu à droite */}
        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between overflow-hidden">
          {/* Titre en italique */}
          <h3 className="text-sm md:text-base lg:text-lg italic font-medium text-gray-900 mb-1 md:mb-2 line-clamp-2">{titre}</h3>

          {/* Badge statut + Date + Auteur sur la même ligne */}
          <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 mb-1 md:mb-2 text-[10px] md:text-xs flex-wrap">
            <div className="flex items-center gap-1 md:gap-1.5">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-600 rounded-full"></div>
              <span className={`font-medium ${getStatutColor()}`}>{statut}</span>
            </div>
            <span className="text-gray-900">Déclaré le {date}</span>
            <span className="text-gray-900 font-medium">{auteur}</span>
          </div>

          {/* Description */}
          <p className="text-[11px] md:text-xs lg:text-sm text-gray-900 leading-relaxed line-clamp-2 md:line-clamp-3 mb-1">{description}</p>

          {/* Coordonnées GPS */}
          {coordonnees && (
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-500 mt-auto">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-3 md:h-3">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {coordonnees}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
