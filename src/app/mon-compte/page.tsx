'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export default function MonComptePage() {
  const router = useRouter();
  const { user, loading, signOut } = useSupabaseAuth();
  const [habitantData, setHabitantData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function loadHabitantData() {
      if (user) {
        const response = await fetch(`/api/habitants?auth_user_id=${user.id}`);
        const { data, error } = await response.json();
        if (!error && data && data.length > 0) {
          setHabitantData(data[0]);
        }
      }
    }
    loadHabitantData();
  }, [user]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{
      padding: isMobile ? '20px' : '40px',
      maxWidth: '1200px',
      // margin: '0 auto',
      paddingBottom: isMobile ? '100px' : '40px'
    }}>
      {/* Conteneur principal - tout dans un bloc sur mobile, séparé sur desktop */}
      {isMobile ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Conteneur photo + bouton d'édition */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            {/* Image de profil */}
            <div style={{
              width: '150px',
              height: '150px',
              backgroundColor: '#e5e7eb',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#d1d5db',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: '700',
                color: '#9ca3af'
              }}>
                {habitantData?.prenom?.[0]?.toUpperCase() || 'U'}{habitantData?.nom?.[0]?.toUpperCase() || ''}
              </div>
            </div>
            
            {/* Bouton d'édition */}
            <button 
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <PencilSquareIcon width={24} height={24} />
            </button>
          </div>

          {/* Informations */}
          <div style={{ position: 'relative' }}>


          {/* Nom complet */}
          <h2 style={{
            fontSize: isMobile ? '22px' : '64px',
            fontWeight: '700',
            marginBottom: isMobile ? '20px' : '24px',
            color: '#1e293b',
            paddingRight: '40px'
          }}>
            {habitantData?.prenom || user?.user_metadata?.prenom || 'Utilisateur'} {habitantData?.nom || user?.user_metadata?.nom || ''}
          </h2>

          {/* Liste des informations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '16px' }}>
            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m2 7 10 6 10-6"></path>
              </svg>
              <span style={{ color: '#4b5563', fontSize: isMobile ? '14px' : '15px', wordBreak: 'break-word' }}>
                {habitantData?.email || user?.email || 'Email non renseigné'}
              </span>
            </div>

            {/* Téléphone */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span style={{ color: '#4b5563', fontSize: isMobile ? '14px' : '15px', wordBreak: 'break-word' }}>
                {habitantData?.telephone || 'Téléphone non renseigné'}
              </span>
            </div>

            {/* Adresse */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span style={{ color: '#4b5563', fontSize: isMobile ? '14px' : '15px', wordBreak: 'break-word' }}>
                {habitantData?.adresse || 'Adresse non renseignée'}
              </span>
            </div>

            {/* Date de naissance */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span style={{ color: '#4b5563', fontSize: isMobile ? '14px' : '15px', wordBreak: 'break-word' }}>
                {habitantData?.date_naissance ? new Date(habitantData.date_naissance).toLocaleDateString('fr-FR') : 'Date de naissance non renseignée'}
              </span>
            </div>

            {/* Statut */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              <span style={{ color: '#4b5563', fontSize: isMobile ? '14px' : '15px', wordBreak: 'break-word' }}>
                {habitantData?.role || user?.user_metadata?.role || 'Habitant'}
              </span>
            </div>
          </div>

          {/* Bouton Déconnexion */}
          <button
            onClick={handleSignOut}
            style={{
              marginTop: isMobile ? '24px' : '32px',
              backgroundColor: '#1e293b',
              color: 'white',
              padding: isMobile ? '12px 24px' : '12px 32px',
              borderRadius: '8px',
              border: 'none',
              fontSize: isMobile ? '14px' : '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              width: 'auto',
              alignSelf: isMobile ? 'flex-start' : 'auto'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
          >
            Déconnexion
          </button>
          </div>
        </div>
      ) : (
        // Version desktop - avec les blocs séparés
        <div style={{ 
          display: 'flex', 
          gap: '40px' 
        }}>
          {/* Image de profil à gauche */}
          <div style={{
            width: '300px',
            // height: '280px',
            backgroundColor: '#e5e7eb',
            borderRadius: '12px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '64px',
              fontWeight: '700',
              color: '#9ca3af'
            }}>
              {habitantData?.prenom?.[0]?.toUpperCase() || 'U'}{habitantData?.nom?.[0]?.toUpperCase() || ''}
            </div>
          </div>

          {/* Bloc informations */}
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ position: 'relative' }}>
              {/* Bouton d'édition */}
              <button 
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>

              {/* Nom complet */}
              <h2 style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '24px',
                color: '#1e293b',
                paddingRight: '40px'
              }}>
                {habitantData?.prenom || user?.user_metadata?.prenom || 'Utilisateur'} {habitantData?.nom || user?.user_metadata?.nom || ''}
              </h2>

              {/* Liste des informations - Desktop */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m2 7 10 6 10-6"></path>
                  </svg>
                  <span style={{ color: '#4b5563', fontSize: '15px', wordBreak: 'break-word' }}>
                    {habitantData?.email || user?.email || 'Email non renseigné'}
                  </span>
                </div>

                {/* Téléphone */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span style={{ color: '#4b5563', fontSize: '15px', wordBreak: 'break-word' }}>
                    {habitantData?.telephone || 'Téléphone non renseigné'}
                  </span>
                </div>

                {/* Adresse */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span style={{ color: '#4b5563', fontSize: '15px', wordBreak: 'break-word' }}>
                    {habitantData?.adresse || 'Adresse non renseignée'}
                  </span>
                </div>

                {/* Date de naissance */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span style={{ color: '#4b5563', fontSize: '15px', wordBreak: 'break-word' }}>
                    {habitantData?.date_naissance ? new Date(habitantData.date_naissance).toLocaleDateString('fr-FR') : 'Date de naissance non renseignée'}
                  </span>
                </div>

                {/* Statut */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                  </svg>
                  <span style={{ color: '#4b5563', fontSize: '15px', wordBreak: 'break-word' }}>
                    {habitantData?.role || user?.user_metadata?.role || 'Habitant'}
                  </span>
                </div>
              </div>

              {/* Bouton Déconnexion - Desktop */}
              <button
                onClick={handleSignOut}
                style={{
                  marginTop: '32px',
                  backgroundColor: '#1e293b',
                  color: 'white',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#334155'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1e293b'}
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
