'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
import { useHabitant } from '@/lib/contexts/HabitantContext';
import { LoiReglementation } from '@/types/entities';
import { Signalement } from '@/types/signalements';
import AlertBanner from '@/components/compte/AlertBanner';
import Button from '@/components/ui/Button';
import CardLoi from '@/components/compte/CardLoi';
import CardIncident from '@/components/ui/CardIncident';
import Pagination from '@/components/compte/Pagination';
import { getPublicUrlFromPath } from '@/lib/services/storage.service';
import { habitantsService } from '@/lib/services/habitants.service';
import { useSearchLois } from '@/lib/hooks/useLois';

type TabType = 'lois' | 'incidents' | 'profil';

const geometricImagePlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="683" height="451" viewBox="0 0 683 451"%3E%3Crect fill="%23053f5c" width="683" height="451"/%3E%3Cpolygon fill="%23f27f09" points="300,100 450,250 300,400"/%3E%3Cpolygon fill="%23f7ad19" points="100,350 250,451 0,451"/%3E%3Cpolygon fill="%23053f5c" points="500,50 683,200 500,350"/%3E%3C/svg%3E';

export default function MonComptePage() {
  const router = useRouter();
  const { user, loading, signOut } = useSupabaseAuth();
  const { habitantData, refetch } = useHabitant();
  const [activeTab, setActiveTab] = useState<TabType>('lois');
  const [loisData, setLoisData] = useState<LoiReglementation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingLois, setLoadingLois] = useState(false);

  // Récupérer toutes les lois depuis la base de données
  const { data: allLois, isLoading: isLoadingAllLois } = useSearchLois('');

  // États pour les incidents
  const [incidentsData, setIncidentsData] = useState<Signalement[]>([]);
  const [allIncidents, setAllIncidents] = useState<Signalement[]>([]);
  const [currentPageIncidents, setCurrentPageIncidents] = useState(1);
  const [totalPagesIncidents, setTotalPagesIncidents] = useState(1);
  const [loadingIncidents, setLoadingIncidents] = useState(false);

  // États pour l'édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    email: habitantData?.email || user?.email || '',
    phone_number: habitantData?.phone_number || '',
    adresse: habitantData?.adresse || '',
    date_naissance: habitantData?.date_naissance || '',
    role: habitantData?.role || 'habitant'
  });

  // Gérer la pagination des lois
  useEffect(() => {
    if (activeTab === 'lois' && allLois) {
      const ITEMS_PER_PAGE = 2;
      const calculatedTotalPages = Math.ceil(allLois.length / ITEMS_PER_PAGE);
      setTotalPages(calculatedTotalPages);

      // Paginer les résultats
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedLois = allLois.slice(startIndex, endIndex);

      setLoisData(paginatedLois);
      setLoadingLois(false);
    }
  }, [activeTab, currentPage, allLois]);

  // Mettre à jour l'état de chargement
  useEffect(() => {
    setLoadingLois(isLoadingAllLois);
  }, [isLoadingAllLois]);

  // Charger les incidents une seule fois au montage
  useEffect(() => {
    async function loadIncidents() {
      setLoadingIncidents(true);
      try {
        const response = await fetch(`/api/signalements`);
        const { data, error } = await response.json();

        if (!error && data) {
          setAllIncidents(data);

          // Pagination côté client
          const itemsPerPage = 2;
          const totalPages = Math.ceil(data.length / itemsPerPage);
          setTotalPagesIncidents(totalPages);

          const startIndex = 0;
          const endIndex = itemsPerPage;
          const paginatedIncidents = data.slice(startIndex, endIndex);
          setIncidentsData(paginatedIncidents);
        }
      } catch (error) {
        console.error('Error loading incidents:', error);
      } finally {
        setLoadingIncidents(false);
      }
    }
    loadIncidents();
  }, []);

  // Gérer la pagination des incidents
  useEffect(() => {
    if (allIncidents.length > 0) {
      const itemsPerPage = 2;
      const startIndex = (currentPageIncidents - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedIncidents = allIncidents.slice(startIndex, endIndex);
      setIncidentsData(paginatedIncidents);
    }
  }, [currentPageIncidents, allIncidents]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageChangeIncidents = (page: number) => {
    setCurrentPageIncidents(page);
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!habitantData?.id) return;

      console.log('Saving profile data:', profileData);

      const { data, error } = await habitantsService.update(habitantData.id, {
        email: profileData.email,
        phone_number: profileData.phone_number,
      });

      if (error) throw error;

      if (data) {
        await refetch();
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Fonction pour générer les pages à afficher avec ellipsis
  const getPaginationPages = (currentPage: number, totalPages: number) => {
    const pages: (number | string)[] = [];
    const maxPagesDisplay = 6; // Nombre max de pages à afficher avant ellipsis

    if (totalPages <= 8) {
      // Si peu de pages, les afficher toutes
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Afficher les 6 premières pages
      for (let i = 1; i <= maxPagesDisplay; i++) {
        pages.push(i);
      }
      // Ajouter ellipsis et dernière page si nécessaire
      if (totalPages > maxPagesDisplay) {
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  // Initialiser les variables avec données ou valeurs par défaut
  const initials = habitantData ? `${habitantData?.prenom?.[0]?.toUpperCase()}${habitantData?.nom?.[0]?.toUpperCase()}` : '';
  const fullName = habitantData ? `${habitantData?.prenom} ${habitantData?.nom}` : '';
  const commune = habitantData ? `${habitantData?.communes?.nom}` : '';

  return (
    <div className="bg-[#f5fcfe] min-h-screen relative">
      {/* Main Content - offset for sidebar */}
      <div className="flex flex-col">
        {/* Alert Banner */}
        <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />

        {/* Profile + Design Section */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-between px-4 md:px-12 gap-10">
          {/* Left: Profile Section */}
          <div className="flex flex-col items-center md:items-start gap-5 w-full md:w-[500px] mb-5 md:mb-0 shrink-0">
            <div className="flex flex-col items-center md:items-start gap-5">
              <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between w-full md:w-[500px]">
                <div className="flex flex-col gap-3 items-center md:items-start">
                  {/* Avatar */}
                  <div className="bg-[#fef0e3] border-2 border-[#f27f09] rounded-full w-24 h-24 flex items-center justify-center">
                    <span
                      className="text-[#f27f09] text-[30px] leading-[40px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {initials}
                    </span>
                  </div>

                  {/* Name and Role */}
                  <div className="flex flex-col text-[#242a35] text-center md:text-left">
                    <h1
                      className="text-[20px] md:text-[48px] font-bold leading-[32px] md:leading-[64px] overflow-hidden text-ellipsis"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {fullName}
                    </h1>
                    <p
                      className="text-[18px] md:text-[36px] font-medium leading-[24px] md:leading-[48px] overflow-hidden text-ellipsis"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Habitant
                    </p>
                  </div>
                </div>
              </div>

              {/* Commune Info */}
              <div
                className="flex flex-col text-[#242a35] font-medium text-center md:text-left"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <p className="font-['Montserrat'] font-medium text-[16px] md:text-[20px] leading-[16px] md:leading-[32px]">Commune</p>
                <p className="font-['Montserrat'] font-medium text-[14px] md:text-[18px] leading-[14px] md:leading-[28px]">{commune}</p>
              </div>
            </div>

            {/* Disconnect Button */}
            <Button className="text-['Poppins'] text-[14px] font-medium" variant="primary" size="sm" onClick={async () => {
              if (signOut) {
                await signOut();
                router.push('/signin');
              }
            }}>
              Déconnexion
            </Button>

          </div>

          {/* Right: Geometric Design Image */}
          <div className="hidden md:block w-[600px] h-[400px] rounded-[24px] overflow-hidden shrink-0">
            <Image
              src={geometricImagePlaceholder}
              alt="Design géométrique"
              className="w-full h-full object-cover"
              width={683}
              height={451}
            />
          </div>
        </div>

        {/* Tabs + Content Section */}
        <div className="flex flex-col gap-6 md:gap-10 items-center px-4 md:px-12 w-full mx-auto">
          {/* Tabs */}
          <div className="flex flex-col gap-6 w-full">
            <div className="flex gap-4 md:gap-12 items-center w-full">
              <button
                onClick={() => setActiveTab('lois')}
                className={`font-medium text-[16px] md:text-[20px] ${activeTab === 'lois' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
                  }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Lois consultés
              </button>
              <button
                onClick={() => setActiveTab('incidents')}
                className={`font-medium text-[16px] md:text-[20px] ${activeTab === 'incidents' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
                  }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Incidents consultés
              </button>
              <button
                onClick={() => setActiveTab('profil')}
                className={`font-medium text-[16px] md:text-[20px] ${activeTab === 'profil' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
                  }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Profil
              </button>
            </div>
            <div className="h-0 w-full border-t border-[#475569]" />
          </div>

          {/* Cards Content */}
          {activeTab === 'lois' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-12 w-full">
                {loadingLois ? (
                  <div className="col-span-2 text-center w-full py-20">
                    <p className="text-gray-500">Chargement des lois...</p>
                  </div>
                ) : loisData.length === 0 ? (
                  <div className="col-span-2 text-center w-full py-20">
                    <p className="text-gray-500">Aucune loi consultée pour le moment.</p>
                  </div>
                ) : (
                  loisData.map((loi) => (
                    <div key={loi.id} className="bg-white rounded-3xl border border-[#E7EAED] p-4 md:p-6 h-[172px] w-full flex flex-col justify-between">
                      <div className="flex flex-col gap-3 md:gap-[20px]">
                        <h2 className="font-['Montserrat'] text-normal text-sm md:text-[14px] line-clamp-2">{loi.titre}</h2>
                        <div className="flex items-center gap-[8px]">
                          <span className="border border-[#475569] bg-[#E7EAED] text-[#64748B] px-[4px] py-[2px] rounded-sm font-['Montserrat'] font-normal text-xs md:text-[13px]">
                            {loi.thematique || 'Text'}
                          </span>
                        </div>
                      </div>
                      <div className='flex justify-between items-center gap-2'>
                        <div className="flex items-center justify-center w-[32px] h-[32px] bg-[#F5FCFE] rounded hover:bg-[#E7EAED] transition-colors cursor-pointer" onClick={() => window.open(`/lois/${loi.id}`, '_blank')}>
                          <ArrowTopRightOnSquareIcon className="w-[20px] h-[20px] text-[#475569]" />
                        </div>
                        <span className="font-[Montserrat] text-sm md:text-[14px] font-normal text-[#F27F09] cursor-pointer hover:text-[#d66d07] transition-colors flex-1 text-right" onClick={() => router.push(`/lois/${loi.id}`)}> Lire plus</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!loadingLois && loisData.length > 0 && (
                <div className="flex justify-center items-center gap-1 md:gap-2 mt-6 flex-wrap">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Page précédente"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {getPaginationPages(currentPage, totalPages).map((page) => (
                    page === '...' ? (
                      <span key="ellipsis" className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-gray-600">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded font-['Montserrat'] font-normal text-sm md:text-[16px] transition-colors ${currentPage === page
                          ? 'bg-[#F27F09] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Page suivante"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'incidents' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
                {loadingIncidents ? (
                  <div className="col-span-2 text-center w-full py-20">
                    <p className="text-gray-500">Chargement des incidents...</p>
                  </div>
                ) : incidentsData.length === 0 ? (
                  <div className="col-span-2 text-center w-full py-20">
                    <p className="text-gray-500">Aucun incident en cours pour le moment</p>
                  </div>
                ) : (
                  incidentsData.map((signalement) => (
                    <CardIncident
                      key={signalement.id}
                      title={signalement.titre}
                      label={signalement.statut || 'Signalé'}
                      date={signalement.created_at ? new Date(signalement.created_at).toLocaleDateString() : 'Date inconnue'}
                      username={signalement.prenom && signalement.nom ? `${signalement.prenom} ${signalement.nom}` : 'Anonyme'}
                      description={signalement.description || 'Aucune description'}
                      image={signalement.photos_signalement?.[0]?.url ? getPublicUrlFromPath(signalement.photos_signalement[0].url) : undefined}
                      onClick={() => router.push(`/signalements/${signalement.id}`)}
                    />
                  ))
                )}
              </div>

              {!loadingIncidents && incidentsData.length > 0 && totalPagesIncidents > 1 && (
                <div className="flex justify-center items-center gap-1 md:gap-2 mt-6 flex-wrap">
                  <button
                    onClick={() => handlePageChangeIncidents(currentPageIncidents - 1)}
                    disabled={currentPageIncidents === 1}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Page précédente"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {getPaginationPages(currentPageIncidents, totalPagesIncidents).map((page) => (
                    page === '...' ? (
                      <span key="ellipsis" className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-gray-600">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChangeIncidents(page as number)}
                        className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded font-['Montserrat'] font-normal text-sm md:text-[16px] transition-colors ${currentPageIncidents === page
                          ? 'bg-[#F27F09] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  ))}

                  <button
                    onClick={() => handlePageChangeIncidents(currentPageIncidents + 1)}
                    disabled={currentPageIncidents === totalPagesIncidents}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Page suivante"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'profil' && (
            <div className="bg-white rounded-[24px] border border-[#e7eaed] w-full p-4">
              {/* Header avec bouton d'édition */}
              <div className="flex justify-end">
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 text-[#053f5c] hover:text-[#f27f09] transition-colors"
                  >
                    <svg width="19" height="19" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    {/* <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Modifier</span> */}
                  </button>
                ) : (
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-[#f27f09] text-[#242a35] rounded-lg hover:bg-[#e06f08] transition-colors"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Enregistrer
                    </button>
                  </div>
                )}
              </div>

              {/* Liste des informations du profil */}
              <div className="flex flex-col gap-3">
                {/* Email */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#f5fcfe] rounded-lg shrink-0">
                    <svg width="19" height="19" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="#053f5c" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 6 10-6" />
                    </svg>
                  </div>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#e7eaed] rounded-lg focus:outline-none focus:border-[#f27f09]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    />
                  ) : (
                    <span
                      className="text-[#053f5c] font-medium text-[16px] md:text-[20px]"
                      style={{
                        fontFamily: 'Montserrat'
                      }}
                    >
                      {profileData.email || 'Email non renseigné'}
                    </span>
                  )}
                </div>

                {/* Téléphone */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#f5fcfe] rounded-lg shrink-0">
                    <svg width="19" height="19" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="#053f5c" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={profileData.phone_number}
                      onChange={(e) => handleProfileChange('phone_number', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#e7eaed] rounded-lg focus:outline-none focus:border-[#f27f09]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    />
                  ) : (
                    <span
                      className="text-[#053f5c] font-medium text-[16px] md:text-[20px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {profileData.phone_number || 'Téléphone non renseigné'}
                    </span>
                  )}
                </div>

                {/* Adresse */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#f5fcfe] rounded-lg shrink-0">
                    <svg width="19" height="19" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="#053f5c" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData.adresse}
                      onChange={(e) => handleProfileChange('adresse', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#e7eaed] rounded-lg focus:outline-none focus:border-[#f27f09]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                      placeholder="Aucune adresse renseignée"
                    />
                  ) : (
                    <span
                      className="text-[#053f5c] font-medium text-[16px] md:text-[20px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {`${habitantData?.communes?.nom}`}
                    </span>
                  )}
                </div>

                {/* Statut */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#f5fcfe] rounded-lg shrink-0">
                    <svg width="19" height="19" className="md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="#053f5c" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span
                    className="text-[#053f5c] font-medium text-[16px] md:text-[20px] capitalize"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {`${habitantData?.role}`}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}
