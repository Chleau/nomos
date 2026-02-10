'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
import AlertBanner from '@/components/compte/AlertBanner';
import Button from '@/components/ui/Button';

type TabType = 'securite' | 'notifications' | 'langue' | 'confidentialite';

interface SessionDevice {
  id: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile';
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ParametresPage() {
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [activeTab, setActiveTab] = useState<TabType>('securite');
  
  // États pour les mots de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // État pour la 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Sessions actives (mock data)
  const [sessions, setSessions] = useState<SessionDevice[]>([
    {
      id: '1',
      deviceName: 'Windows PC',
      deviceType: 'desktop',
      location: 'Paris, France',
      lastActive: 'Actif maintenant',
      isCurrent: true
    },
    {
      id: '2',
      deviceName: 'Iphone 14',
      deviceType: 'mobile',
      location: 'Paris, France',
      lastActive: 'Il y a 2 heures',
      isCurrent: false
    },
    {
      id: '3',
      deviceName: 'Windows PC',
      deviceType: 'desktop',
      location: 'Paris, France',
      lastActive: 'Il y a 2 heures',
      isCurrent: false
    }
  ]);

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    // TODO: Appel API pour mettre à jour le mot de passe
    console.log('Updating password...');
  };

  const handleDisconnectSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  return (
    <div className="bg-[#f5fcfe] min-h-screen relative">
      {/* Main Content */}
      <div className="flex flex-col">
        {/* Alert Banner */}
        <AlertBanner message="⚠️ Attention : À 100m de votre position, Rue de Rivoli, un arbre bloque le passage." />

        {/* Titre Principal */}
        <div className="px-12 py-9">
          <h1 
            className="text-[#242a35] text-[36px] leading-normal"
            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
          >
            Paramètres
          </h1>
        </div>

        {/* Tabs + Content Section */}
        <div className="flex flex-col gap-12 items-start px-12 w-full max-w-[1328px] mx-auto">
          {/* Tabs */}
          <div className="flex flex-col gap-6 w-full">
            <div className="flex gap-12 items-center w-full">
              <button 
                onClick={() => setActiveTab('securite')}
                className={`text-[20px] leading-normal ${
                  activeTab === 'securite' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
              >
                Sécurité
              </button>
              <button 
                onClick={() => setActiveTab('notifications')}
                className={`text-[20px] leading-normal ${
                  activeTab === 'notifications' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
              >
                Notifications
              </button>
              <button 
                onClick={() => setActiveTab('langue')}
                className={`text-[20px] leading-normal whitespace-nowrap ${
                  activeTab === 'langue' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
              >
                Langue & Région
              </button>
              <button 
                onClick={() => setActiveTab('confidentialite')}
                className={`text-[20px] leading-normal whitespace-nowrap ${
                  activeTab === 'confidentialite' ? 'text-[#053f5c]' : 'text-[#94a3b8]'
                }`}
                style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
              >
                Confidentialité & Données
              </button>
            </div>
            
            {/* Separator Line */}
            <div className="h-0 w-full border-t border-[#475569]" />
          </div>

          {/* Content pour Sécurité */}
          {activeTab === 'securite' && (
            <div className="flex flex-col gap-12 w-full">
              {/* Section Mot de passe */}
              <div className="flex flex-col gap-2.5 text-[#242a35]">
                <h2 
                  className="text-[30px] leading-normal"
                  style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                >
                  Mot de passe
                </h2>
                <p 
                  className="text-[18px] leading-[28px]"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  Modifiez votre mot de passe pour sécuriser votre compte
                </p>
              </div>

              {/* Inputs pour les mots de passe */}
              <div className="flex flex-col gap-6 w-full">
                {/* Mot de passe actuel */}
                <div className="flex flex-col gap-2">
                  <p 
                    className="text-[#242a35] text-[20px] leading-normal"
                    style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                  >
                    Mot de passe actuel
                  </p>
                  <div className="bg-white border border-[#e7eaed] rounded-[5px] flex items-center gap-3 h-[50px] px-2.5">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                      <path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe actuel"
                      className="flex-1 bg-transparent outline-none text-[14px] text-[#242a35] placeholder:text-[#94a3b8]"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                    />
                    <button
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="p-1.5 hover:bg-gray-50 rounded"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                        {!showCurrentPassword && <line x1="3" y1="3" x2="21" y2="21"/>}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div className="flex flex-col gap-2">
                  <p 
                    className="text-[#242a35] text-[20px] leading-normal"
                    style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                  >
                    Nouveau mot de passe
                  </p>
                  <div className="bg-white border border-[#e7eaed] rounded-[5px] flex items-center gap-3 h-[50px] px-2.5">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                      <path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Entrez votre nouveau mot de passe"
                      className="flex-1 bg-transparent outline-none text-[14px] text-[#242a35] placeholder:text-[#94a3b8]"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                    />
                    <button
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="p-1.5 hover:bg-gray-50 rounded"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                        {!showNewPassword && <line x1="3" y1="3" x2="21" y2="21"/>}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Confirmer mot de passe */}
                <div className="flex flex-col gap-2">
                  <p 
                    className="text-[#242a35] text-[20px] leading-normal"
                    style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                  >
                    Confirmer le mot de passe
                  </p>
                  <div className="bg-white border border-[#e7eaed] rounded-[5px] flex items-center gap-3 h-[50px] px-2.5">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                      <path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez votre nouveau mot de passe"
                      className="flex-1 bg-transparent outline-none text-[14px] text-[#242a35] placeholder:text-[#94a3b8]"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                    />
                    <button
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="p-1.5 hover:bg-gray-50 rounded"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                        {!showConfirmPassword && <line x1="3" y1="3" x2="21" y2="21"/>}
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Bouton de mise à jour */}
                <button
                  onClick={handleUpdatePassword}
                  className="bg-[#f27f09] px-4 py-2 rounded-lg self-start text-[#242a35] text-[14px] leading-normal hover:bg-[#e06f08] transition-colors"
                  style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                >
                  Mettre à jour le mot de passe
                </button>
              </div>

              {/* Section 2FA */}
              <div className="flex flex-col gap-2.5 text-[#242a35]">
                <h2 
                  className="text-[30px] leading-normal"
                  style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                >
                  Double authentification (2FA)
                </h2>
                <p 
                  className="text-[18px] leading-[28px]"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </p>
              </div>

              {/* Toggle 2FA */}
              <div className="bg-white rounded-[24px] px-3.5 py-8 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col gap-1">
                    <p 
                      className="text-[#242a35] text-[20px] leading-normal"
                      style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                    >
                      Authentification à deux facteurs
                    </p>
                    <p 
                      className="text-[#64748b] text-[12px] leading-normal"
                      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                    >
                      {twoFactorEnabled ? 'Activée' : 'Désactivée'}
                    </p>
                  </div>
                  
                  {/* Toggle Switch */}
                  <button
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`w-[60px] h-[30px] rounded-[24px] p-[5px] transition-colors ${
                      twoFactorEnabled ? 'bg-[#f27f09]' : 'bg-[#e2e8f0]'
                    }`}
                  >
                    <div 
                      className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        twoFactorEnabled ? 'translate-x-[30px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Section Sessions actives */}
              <div className="flex flex-col gap-2.5 text-[#242a35]">
                <h2 
                  className="text-[30px] leading-normal"
                  style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                >
                  Sessions actives
                </h2>
                <p 
                  className="text-[18px] leading-[28px]"
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  Gérez les appareils connectés à votre compte
                </p>
              </div>

              {/* Liste des sessions */}
              <div className="flex flex-col gap-6 w-full">
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    className="bg-white border border-white rounded-[24px] px-4 py-1 h-[82px] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="bg-[#d9f5fb] rounded-xl w-[45px] h-[45px] flex items-center justify-center">
                        {session.deviceType === 'desktop' ? (
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="2" y="3" width="16" height="11" rx="1" stroke="#242a35" strokeWidth="2"/>
                            <path d="M6 18h8M10 14v4" stroke="#242a35" strokeWidth="2"/>
                          </svg>
                        ) : (
                          <svg width="14" height="24" viewBox="0 0 14 24" fill="none">
                            <rect x="1" y="1" width="12" height="22" rx="2" stroke="#242a35" strokeWidth="2"/>
                            <circle cx="7" cy="19" r="1" fill="#242a35"/>
                          </svg>
                        )}
                      </div>
                      
                      {/* Device Info */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p 
                            className="text-[#242a35] text-[20px] leading-normal"
                            style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}
                          >
                            {session.deviceName}
                          </p>
                          {session.isCurrent && (
                            <span 
                              className="bg-[#f3faf4] border border-[#9bdaa5] rounded-md px-1 py-0.5 text-[#43a854] text-[12px] leading-[16px]"
                              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                            >
                              Session actuelle
                            </span>
                          )}
                        </div>
                        <p 
                          className="text-[#64748b] text-[14px] leading-normal"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 400 }}
                        >
                          {session.location} • {session.lastActive}
                        </p>
                      </div>
                    </div>

                    {/* Disconnect Button */}
                    {!session.isCurrent && (
                      <button
                        onClick={() => handleDisconnectSession(session.id)}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2 2L14 14M14 2L2 14" stroke="#ff1919" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span 
                          className="text-[#ff1919] text-[16px] leading-[24px]"
                          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                        >
                          Se déconnecter
                        </span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content pour Notifications */}
          {activeTab === 'notifications' && (
            <div className="text-center w-full py-20">
              <p className="text-lg text-gray-600">Paramètres de notifications à venir...</p>
            </div>
          )}

          {/* Content pour Langue & Région */}
          {activeTab === 'langue' && (
            <div className="text-center w-full py-20">
              <p className="text-lg text-gray-600">Paramètres de langue et région à venir...</p>
            </div>
          )}

          {/* Content pour Confidentialité & Données */}
          {activeTab === 'confidentialite' && (
            <div className="text-center w-full py-20">
              <p className="text-lg text-gray-600">Paramètres de confidentialité et données à venir...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
