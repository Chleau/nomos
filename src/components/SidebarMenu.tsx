'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
import { UserRole } from '@/types/auth';
import type { Habitant } from '@/types/habitants';

interface HabitantFull extends Habitant {
  communes?: { nom: string };
}
import {
  HomeIcon,
  MapIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  BellSlashIcon,
  ExclamationTriangleIcon,
  PlusCircleIcon,
  NewspaperIcon,
  InboxIcon,
  FolderIcon,
  MapPinIcon,
  BuildingLibraryIcon,
  DocumentChartBarIcon,
  Bars3Icon

} from '@heroicons/react/24/outline';

const mobileMenuItems = [
  // Habitants
  { label: 'Accueil', href: '/', icon: HomeIcon, roles: ['habitant'] },
  { label: 'Carte', href: '/carte-incidents', icon: MapIcon, roles: ['habitant'] },
  { label: 'Lois', href: '/lois', icon: NewspaperIcon, roles: ['habitant'] },
  { label: 'Menu', href: '/signalements', icon: Bars3Icon, roles: ['habitant'] },
  // Mairie
  { label: 'Accueil', href: '/mairie', icon: HomeIcon, roles: ['mairie'] },
  { label: 'Lois', href: '/mairie/lois-en-vigueur', icon: NewspaperIcon, roles: ['mairie'] },
  { label: 'Signalements', href: '/mairie/signalement-habitants', icon: MapPinIcon, roles: ['mairie'] },
  { label: 'Menu', href: '/mairie/archives', icon: Bars3Icon, roles: ['mairie'] },
];

export default function SidebarMenu() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useSupabaseAuth();
  const [habitantData, setHabitantData] = useState<HabitantFull | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  // Déterminer le rôle de l'utilisateur - attendre que habitantData soit chargé
  const userRole = habitantData?.role as UserRole;
  const isMairieUser = habitantData ? [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MAIRIE
  ].includes(userRole) : false;

  // Charger les données de l'habitant depuis la table habitants
  useEffect(() => {
    async function loadHabitantData() {
      if (user) {
        try {
          const response = await fetch(`/api/habitants?auth_user_id=${user.id}`);
          const result = await response.json();
          if (!result.error && result.data && result.data.length > 0) {
            setHabitantData(result.data[0]);
          }
        } catch (err) {
          console.error('Error loading habitant data:', err);
        }
        setDataLoaded(true);
      }
    }
    loadHabitantData();
  }, [user]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1024); // Tablette et mobile
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Fermer le menu mobile quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Rendu conditionnel selon la taille d'écran
  if (isMobile) {
    // Filtrer les items du menu selon le rôle
    const filteredMobileItems = mobileMenuItems.filter(item => {
      if (!dataLoaded) return false;

      if (isMairieUser) {
        return item.roles.includes('mairie');
      } else {
        return item.roles.includes('habitant');
      }
    });

    return (
      <>
        {/* Bouton flottant d'action principale */}
        {dataLoaded && !isMobileMenuOpen && (
          isMairieUser ? (
            <Link
              href="/mairie/nouveau-arrete"
              className={`floating-button ${pathname === '/mairie/nouveau-arrete' ? 'active' : ''}`}
              style={{ backgroundColor: '#053F5C' }} // Couleur spécifique mairie
            >
              <PencilSquareIcon width="34" height="34" />
            </Link>
          ) : (
            <Link
              href="/signaler-incident"
              className={`floating-button ${pathname === '/signaler-incident' ? 'active' : ''}`}
            >
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 1C17.4865 1 17.9637 1.13402 18.3789 1.3877C18.7941 1.6415 19.1316 2.00538 19.3535 2.43848L19.3545 2.43945V2.44043L32.7168 29.165C32.9194 29.5676 33.0168 30.0168 32.998 30.4658V30.4668C32.9791 30.9172 32.8451 31.3554 32.6094 31.7393C32.3734 32.1234 32.0433 32.4405 31.6504 32.6611C31.2576 32.8817 30.8143 32.9986 30.3633 33H3.63672C3.18581 32.9986 2.7426 32.8818 2.34961 32.6611C1.95665 32.4404 1.6264 32.1233 1.39062 31.7393C1.15493 31.3553 1.02089 30.9171 1.00195 30.4668C0.983107 30.0168 1.07991 29.569 1.28223 29.167L14.6465 2.43848C14.8683 2.00548 15.2058 1.64155 15.6211 1.3877C16.0363 1.13403 16.5135 1 17 1Z" fill="#F27F09" stroke="#242A35" strokeWidth="2" />
                <g transform="translate(10, 13)">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.33398 7.00016H11.6673M7.00065 2.3335V11.6668" stroke="#242A35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </g>
              </svg>
            </Link>
          )
        )}

        {/* Menu overlay mobile type CAF */}
        {isMobileMenuOpen && (
          <div
            className="mobile-full-menu-overlay"
            role="button"
            tabIndex={0}
            onClick={() => setIsMobileMenuOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setIsMobileMenuOpen(false)}
          >
            <div
              className="mobile-full-menu-container"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {/* Barre de navigation au-dessus (Header du menu) */}
              <div className="mobile-menu-header-bar">
                {filteredMobileItems.map(item => {
                  const IconComponent = item.icon;
                  const isMenuButton = item.label === 'Menu';

                  if (isMenuButton) {
                    return (
                      <button
                        key="close-button"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="mobile-menu-item close-item"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: '4px' }}>
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ textAlign: 'center', fontSize: '11px', fontWeight: '500' }}>Fermer</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mobile-menu-item ${pathname === item.href ? 'active' : ''}`}
                    >
                      <IconComponent width="24" height="24" style={{ marginBottom: '4px' }} />
                      <span style={{ textAlign: 'center', fontSize: '11px', fontWeight: '500' }}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Contenu des sous-menus en dessous */}
              <div className="mobile-menu-content no-scrollbar">
                <nav className="mobile-menu-links">
                  {!isMairieUser && (
                    <Link
                      href="/dernieres-arretes"
                      className={`mobile-drawer-link ${pathname === '/dernieres-arretes' ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="link-icon-bg">
                        <DocumentChartBarIcon width="24" height="24" />
                      </div>
                      <div className="link-text">
                        <span className="title">Derniers arrêtés</span>
                        <span className="description">Consultez les décisions municipales récentes</span>
                      </div>
                    </Link>
                  )}

                  {!isMairieUser && (
                    <Link
                      href="/signalements"
                      className={`mobile-drawer-link ${pathname === '/signalements' ? 'active' : ''}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="link-icon-bg">
                        <PlusCircleIcon width="24" height="24" />
                      </div>
                      <div className="link-text">
                        <span className="title">Déclarations d&apos;incidents</span>
                        <span className="description">Voir vos signalements et leur état</span>
                      </div>
                    </Link>
                  )}

                  {isMairieUser && (
                    <>
                      <Link
                        href="/mairie/redactions"
                        className={`mobile-drawer-link ${pathname === '/mairie/redactions' ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="link-icon-bg">
                          <InboxIcon width="24" height="24" />
                        </div>
                        <div className="link-text">
                          <span className="title">Mes rédactions</span>
                          <span className="description">Gérer les projets d'arrêtés en cours</span>
                        </div>
                      </Link>
                      <Link
                        href="/mairie/archives"
                        className={`mobile-drawer-link ${pathname === '/mairie/archives' ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div className="link-icon-bg">
                          <FolderIcon width="24" height="24" />
                        </div>
                        <div className="link-text">
                          <span className="title">Archives</span>
                          <span className="description">Consulter les documents archivés</span>
                        </div>
                      </Link>
                    </>
                  )}

                  <Link
                    href="/parametres"
                    className={`mobile-drawer-link ${pathname === '/parametres' ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="link-icon-bg">
                      <Cog6ToothIcon width="24" height="24" />
                    </div>
                    <div className="link-text">
                      <span className="title">Paramètres</span>
                      <span className="description">Notifications et préférences</span>
                    </div>
                  </Link>
                  <Link
                    href="/mon-compte"
                    className={`mobile-drawer-link ${pathname === '/mon-compte' ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="link-icon-bg">
                      <UserIcon width="24" height="24" />
                    </div>
                    <div className="link-text">
                      <span className="title">Mon compte</span>
                      <span className="description">Gérer vos informations personnelles</span>
                    </div>
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Bar Navigation (Masquée si menu ouvert) */}
        {!isMobileMenuOpen && (
          <nav className="mobile-bottom-bar">
            {dataLoaded ? (
              <div className="mobile-menu-container">
                {filteredMobileItems.map(item => {
                  const IconComponent = item.icon;
                  const isMenuButton = item.label === 'Menu';

                  if (isMenuButton) {
                    return (
                      <button
                        key="menu-button"
                        onClick={() => setIsMobileMenuOpen(true)}
                        className={`mobile-menu-item ${isMobileMenuOpen ? 'active' : ''}`}
                      >
                        <IconComponent width="24" height="24" />
                        <span style={{ textAlign: 'center', fontSize: '11px', fontWeight: '500' }}>{item.label}</span>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mobile-menu-item ${pathname === item.href ? 'active' : ''}`}
                    >
                      <IconComponent width="24" height="24" />
                      <span style={{ textAlign: 'center', fontSize: '11px', fontWeight: '500' }}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mobile-loading">Chargement...</div>
            )}
          </nav>
        )}
      </>
    );
  }

  // Sidebar desktop
  return (
    <aside className="sidebar">
      {/* Profil */}
      <div className="profile-section">
        <div className="profile-avatar">
          {habitantData?.prenom?.[0]?.toUpperCase() || user?.user_metadata?.prenom?.[0]?.toUpperCase()}{habitantData?.nom?.[0]?.toUpperCase() || user?.user_metadata?.nom?.[0]?.toUpperCase()}
        </div>
        <div className="profile-info">
          <div className="profile-name">
            {habitantData?.prenom || user?.user_metadata?.prenom} {habitantData?.nom || user?.user_metadata?.nom}
          </div>
          <div className="profile-role">
            {habitantData?.role || user?.user_metadata?.role || 'Habitant'}
          </div>
        </div>
        <button
          onClick={() => setNotificationsMuted(!notificationsMuted)}
          className="bell-button"
          title={notificationsMuted ? 'Activer les notifications' : 'Désactiver les notifications'}
        >
          {notificationsMuted ? (
            <BellSlashIcon width="24" height="24" />
          ) : (
            <BellIcon width="24" height="24" />
          )}
        </button>
      </div>

      {/* Commune */}
      <div className="commune-section">
        <div className="commune-label">
          Commune
        </div>
        <div className="commune-name">
          {habitantData?.communes?.nom || 'Non spécifiée'}
        </div>
      </div>

      {/* Menu principal */}
      <nav>
        {!dataLoaded ? (
          <div className="menu-loading">
            <p>Chargement du menu...</p>
          </div>
        ) : isMairieUser ? (
          <ul className="menu-list">
            <li className="menu-item">
              <Link href="/mairie" className={`menu-item-link ${pathname === '/mairie' ? 'active' : ''}`}>
                <HomeIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Accueil
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/mairie/lois-en-vigueur" className={`menu-item-link ${pathname === '/mairie/lois-en-vigueur' ? 'active' : ''}`}>
                <NewspaperIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Lois en vigueur
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/mairie/redactions" className={`menu-item-link ${pathname === '/mairie/redactions' ? 'active' : ''}`}>
                <InboxIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Mes rédactions
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/mairie/archives" className={`menu-item-link ${pathname === '/mairie/archives' ? 'active' : ''}`}>
                <FolderIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Archives
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/mairie/signalement-habitants" className={`menu-item-link ${pathname === '/mairie/signalement-habitants' ? 'active' : ''}`}>
                <MapPinIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Signalement des habitants
              </Link>
            </li>
          </ul>
        ) : (
          <ul className="menu-list">
            <li className="menu-item">
              <Link href="/" className={`menu-item-link ${pathname === '/' ? 'active' : ''}`}>
                <HomeIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Accueil
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/carte-incidents" className={`menu-item-link ${pathname === '/carte-incidents' ? 'active' : ''}`}>
                <MapIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Carte des incidents
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/lois" className={`menu-item-link ${pathname === '/lois' ? 'active' : ''}`}>
                <NewspaperIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Lois en vigueur
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/dernieres-arretes" className={`menu-item-link ${pathname === '/dernieres-arretes' ? 'active' : ''}`}>
                <DocumentChartBarIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Derniers arrêtés
              </Link>
            </li>
            <li className="menu-item">
              <Link href="/signalements" className={`menu-item-link ${pathname === '/signalements' ? 'active' : ''}`}>
                <PlusCircleIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Déclarations d&apos;incidents
              </Link>
            </li>
          </ul>
        )}
        {dataLoaded && !isMairieUser && (
          <div>
            <Link href="/signaler-incident" className="action-button habitant">
              <ExclamationTriangleIcon width="24" height="24" />
              Signaler un incident
            </Link>
          </div>
        )}
        {dataLoaded && isMairieUser && (
          <div>
            <Link href="/mairie/nouveau-arrete" className="action-button mairie">
              <PencilSquareIcon width="24" height="24" />
              Nouvelle rédaction
            </Link>
          </div>
        )}
      </nav>

      {/* Bas du menu */}
      <div className="bottom-menu">
        <ul>
          <li>
            <Link
              href="/parametres"
              className={`bottom-menu-link ${pathname === '/parametres' ? 'active' : ''}`}
            >
              <Cog6ToothIcon width="24" height="24" style={{ marginRight: '12px' }} />
              Paramètres
            </Link>
          </li>
          <li>
            <Link
              href="/mon-compte"
              className={`bottom-menu-link ${pathname === '/mon-compte' ? 'active' : ''}`}
            >
              <UserIcon width="24" height="24" style={{ marginRight: '12px' }} />
              Mon compte
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}

