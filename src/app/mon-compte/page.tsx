'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
import { LoiReglementation } from '@/types/entities';
import { Signalement } from '@/types/signalements';
import AlertBanner from '@/components/compte/AlertBanner';
import Button from '@/components/ui/Button';
import CardLoi from '@/components/compte/CardLoi';
import CardIncident from '@/components/ui/CardIncident';
import Pagination from '@/components/compte/Pagination';
import { getPublicUrlFromPath } from '@/lib/services/storage.service';
import { habitantsService } from '@/lib/services/habitants.service';

type TabType = 'lois' | 'incidents' | 'profil';

const geometricImagePlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="683" height="451" viewBox="0 0 683 451"%3E%3Crect fill="%23053f5c" width="683" height="451"/%3E%3Cpolygon fill="%23f27f09" points="300,100 450,250 300,400"/%3E%3Cpolygon fill="%23f7ad19" points="100,350 250,451 0,451"/%3E%3Cpolygon fill="%23053f5c" points="500,50 683,200 500,350"/%3E%3C/svg%3E';

export default function MonComptePage() {
  const router = useRouter();
  const { user, loading, signOut } = useSupabaseAuth();
  const [habitantData, setHabitantData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('lois');
  const [loisData, setLoisData] = useState<LoiReglementation[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(12);
  const [loadingLois, setLoadingLois] = useState(false);
  
  // États pour les incidents
  const [incidentsData, setIncidentsData] = useState<Signalement[]>([]);
  const [currentPageIncidents, setCurrentPageIncidents] = useState(1);
  const [totalPagesIncidents, setTotalPagesIncidents] = useState(1);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  
  // États pour l'édition du profil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    email: '',
    phone_number: '',
    adresse: '',
    date_naissance: '',
    role: ''
  });

  useEffect(() => {
    async function loadHabitantData() {
      if (user) {
        const response = await fetch(`/api/habitants?auth_user_id=${user.id}`);
        const { data, error } = await response.json();
        if (!error && data && data.length > 0) {
          setHabitantData(data[0]);
          // Initialiser les données du profil
          setProfileData({
            email: data[0].email || user.email || '',
            phone_number: data[0].phone_number || '',
            adresse: data[0].adresse || '',
            date_naissance: data[0].date_naissance || '',
            role: data[0].role || 'habitant'
          });
        }
      }
    }
    loadHabitantData();
  }, [user]);

  useEffect(() => {
    async function loadLois() {
      if (activeTab === 'lois') {
        setLoadingLois(true);
        try {
          // Mock data since API might not be fully implemented
          setLoisData([
            {
              id: 1,
              titre: "LOI organique n° 2022-400 du 21 mars 2022 visant à renforcer le rôle du Défenseur des droits en matière de signalement",
              contenu: "",
              thematique: "Text",
              date_mise_a_jour: new Date().toISOString(),
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              titre: "LOI organique n° 2022-400 du 21 mars 2022 visant à renforcer le rôle du Défenseur des droits en matière de signalement",
              contenu: "",
              thematique: "Text",
              date_mise_a_jour: new Date().toISOString(),
              created_at: new Date().toISOString()
            }
          ] as LoiReglementation[]);
        } catch (error) {
          console.error('Error loading lois:', error);
        } finally {
          setLoadingLois(false);
        }
      }
    }
    loadLois();
  }, [activeTab, currentPage]);

  useEffect(() => {
    async function loadIncidents() {
      if (activeTab === 'incidents') {
        setLoadingIncidents(true);
        try {
          const response = await fetch('/api/signalements');
          const { data, error } = await response.json();
          
          if (!error && data) {
            // Filtrer les incidents "en cours" uniquement
            const incidentsEnCours = data.filter((s: Signalement) => 
              s.statut?.toLowerCase() === 'en cours' || 
              s.statut?.toLowerCase() === 'nouveau'
            );
            
            // Pagination côté client
            const itemsPerPage = 4;
            const totalPages = Math.ceil(incidentsEnCours.length / itemsPerPage);
            setTotalPagesIncidents(totalPages);
            
            const startIndex = (currentPageIncidents - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedIncidents = incidentsEnCours.slice(startIndex, endIndex);
            
            setIncidentsData(paginatedIncidents);
          }
        } catch (error) {
          console.error('Error loading incidents:', error);
        } finally {
          setLoadingIncidents(false);
        }
      }
    }
    loadIncidents();
  }, [activeTab, currentPageIncidents]);

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
      } as any);
      
      if (error) throw error;

      if (data) {
        setHabitantData(data);
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Chargement...</p>
      </div>
    );
  }

  const initials = `${habitantData?.prenom?.[0]?.toUpperCase()}${habitantData?.nom?.[0]?.toUpperCase()}`;
  const fullName = `${habitantData?.prenom} ${habitantData?.nom}`;
  const commune = `${habitantData?.communes?.nom}`;
  const role = `${habitantData?.role}`;

  return (
    <div className="bg-[#f5fcfe] min-h-screen relative">
      {/* Main Content - offset for sidebar */}
      <div className="flex flex-col">
        {/* Alert Banner */}
        <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />

        {/* Profile + Design Section */}
        <div className="flex items-start justify-between px-12 py-9 gap-10">
          {/* Left: Profile Section */}
          <div className="flex flex-col gap-5 w-[500px] shrink-0">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between w-[500px]">
                <div className="flex flex-col gap-3">
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
                  <div className="flex flex-col text-[#242a35]">
                    <h1 
                      className="text-[48px] font-bold leading-[64px] overflow-hidden text-ellipsis"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {fullName}
                    </h1>
                    <p 
                      className="text-[36px] font-medium leading-[48px] overflow-hidden text-ellipsis"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Habitant
                    </p>
                  </div>
                </div>
              </div>

              {/* Commune Info */}
              <div 
                className="flex flex-col text-[#242a35] font-medium w-[368px]"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <p className="text-[20px] leading-[32px]">Commune</p>
                <p className="text-[18px] leading-[28px]">{commune}</p>
              </div>
            </div>

            {/* Disconnect Button */}
            <Button variant="primary" size="sm" onClick={async () => {
                if (signOut) {
                  await signOut();
                  router.push('/signin');
                }
              }}> 
              Déconnexion
            </Button>

          </div>

          {/* Right: Geometric Design Image */}
          <div className="w-[600px] h-[400px] rounded-[24px] overflow-hidden shrink-0">
            <img 
              src={geometricImagePlaceholder} 
              alt="Design géométrique" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Tabs + Content Section */}
        <div className="flex flex-col gap-10 items-center px-12 w-full max-w-[1328px] mx-auto">
          {/* Tabs */}
          <div className="flex flex-col gap-6 w-full">
            <div className="flex gap-12 items-center w-full">
              <button 
                onClick={() => setActiveTab('lois')}
                className={`font-medium text-[20px] ${
                  activeTab === 'lois' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Lois consultés
              </button>
              <button 
                onClick={() => setActiveTab('incidents')}
                className={`font-medium text-[20px] ${
                  activeTab === 'incidents' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Incidents consultés
              </button>
              <button 
                onClick={() => setActiveTab('profil')}
                className={`font-medium text-[20px] ${
                  activeTab === 'profil' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
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
              <div className="flex items-center justify-between w-full gap-12">
                {loadingLois ? (
                  <div className="text-center w-full py-20">
                    <p>Chargement des lois...</p>
                  </div>
                ) : loisData.length === 0 ? (
                  <div className="text-center w-full py-20">
                    <p>Aucune loi consultée pour le moment.</p>
                  </div>
                ) : (
                  <>
                    {loisData.map((loi) => (
                      <CardLoi
                        key={loi.id}
                        title={loi.titre}
                        badge={loi.thematique}
                        link="Lire plus"
                        hasIcon={true}
                        className="w-[592px]"
                        onLinkClick={(e) => {
                          e.stopPropagation();
                          router.push(`/lois/${loi.id}`);
                        }}
                      />
                    ))}
                  </>
                )}
              </div>

              {!loadingLois && loisData.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="w-[448px]"
                />
              )}
            </>
          )}

          {activeTab === 'incidents' && (
            <>
              <div className="grid grid-cols-2 gap-8 w-full">
                {loadingIncidents ? (
                  <div className="col-span-2 text-center w-full py-20">
                    <p>Chargement des incidents...</p>
                  </div>
                ) : incidentsData.length === 0 ? (
                  <div className="col-span-2 text-center w-full py-20">
                    <p>Aucun incident en cours pour le moment</p>
                  </div>
                ) : (
                  incidentsData.map((signalement) => (
                    <CardIncident
                      key={signalement.id}
                      title={signalement.titre}
                      label={signalement.types_signalement?.libelle || 'Incident'}
                      date={new Date(signalement.created_at!).toLocaleDateString()}
                      username={`${signalement.habitants?.prenom || ''} ${signalement.habitants?.nom || ''}`.trim() || 'Anonyme'}
                      description={signalement.description || ''}
                      image={signalement.photos_signalement?.[0]?.url ? getPublicUrlFromPath(signalement.photos_signalement[0].url) : undefined}
                      onClick={() => router.push(`/signalements/${signalement.id}`)}
                    />
                  ))
                )}
              </div>

              {!loadingIncidents && incidentsData.length > 0 && totalPagesIncidents > 1 && (
                <Pagination
                  currentPage={currentPageIncidents}
                  totalPages={totalPagesIncidents}
                  onPageChange={handlePageChangeIncidents}
                  className="w-[448px]"
                />
              )}
            </>
          )}

          {activeTab === 'profil' && (
            <div className="bg-white rounded-[24px] border border-[#e7eaed] w-full max-w-[1328px] p-4">
              {/* Header avec bouton d'édition */}
              <div className="flex justify-end mb-3">
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="flex items-center gap-2 text-[#053f5c] hover:text-[#f27f09] transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    {/* <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Modifier</span> */}
                  </button>
                ) : (
                  <div className="flex gap-2">
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#053f5c" strokeWidth="2">
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
                      className="text-[#053f5c] text-[16px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {profileData.email || 'Email non renseigné'}
                    </span>
                  )}
                </div>

                {/* Téléphone */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#f5fcfe] rounded-lg shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#053f5c" strokeWidth="2">
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
                      className="text-[#053f5c] text-[16px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {profileData.phone_number || 'Téléphone non renseigné'}
                    </span>
                  )}
                </div>

                {/* Adresse */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#f5fcfe] rounded-lg shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#053f5c" strokeWidth="2">
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
                      className="text-[#053f5c] text-[16px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {`${habitantData?.communes?.nom}`}
                    </span>
                  )}
                </div>

                {/* Date de naissance */}
                {/* <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#f5fcfe] rounded-lg shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#053f5c" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  {isEditingProfile ? (
                    <input
                      type="date"
                      value={profileData.date_naissance}
                      onChange={(e) => handleProfileChange('date_naissance', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#e7eaed] rounded-lg focus:outline-none focus:border-[#f27f09]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    />
                  ) : (
                    <span 
                      className="text-[#053f5c] text-[16px]"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {profileData.date_naissance ? new Date(profileData.date_naissance).toLocaleDateString('fr-FR') : '05/11/2002'}
                    </span>
                  )}
                </div> */}

                {/* Statut */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-[#f5fcfe] rounded-lg shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#053f5c" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span 
                    className="text-[#053f5c] text-[16px] capitalize"
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
    </div>
  );
}
