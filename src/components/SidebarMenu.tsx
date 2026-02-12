'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ClockIcon,
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
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

const mobileMenuItems = [
  // Habitants
  { label: 'Accueil', href: '/', icon: HomeIcon, roles: ['habitant'] },
  { label: 'Carte', href: '/carte-incidents', icon: MapIcon, roles: ['habitant'] },
  { label: 'Lois', href: '/lois', icon: DocumentTextIcon, roles: ['habitant', 'mairie'] },
  { label: 'Signalements', href: '/signalements', icon: ClockIcon, roles: ['habitant'] },
  // Mairie
  { label: 'Accueil', href: '/mairie', icon: HomeIcon, roles: ['mairie'] },
  { label: 'Lois', href: '/mairie/derniere-lois-en-vigueur', icon: DocumentTextIcon, roles: ['mairie'] },
  { label: 'Rédactions', href: '/mairie/dernieres-redactions', icon: PencilSquareIcon, roles: ['mairie'] },
  { label: 'Archives', href: '/mairie/archives', icon: ArchiveBoxIcon, roles: ['mairie'] },
  { label: 'Signalements', href: '/mairie/signalement-habitants', icon: UserGroupIcon, roles: ['mairie'] },
];

export default function SidebarMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { user, signOut } = useSupabaseAuth();
  const [habitantData, setHabitantData] = useState<HabitantFull | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(false);


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
        {/* Bouton flottant "Signaler un incident" */}
        {dataLoaded && (
          <Link
            href="/signaler-incident"
            className={`floating-button ${pathname === '/signaler-incident' ? 'active' : ''}`}
          >
            ⚠️
          </Link>
        )}

        {/* Bottom Bar Navigation */}
        <nav className="mobile-bottom-bar">
          {dataLoaded ? (
            <div className="mobile-menu-container">
              {filteredMobileItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mobile-menu-item ${pathname === item.href ? 'active' : ''}`}
                  >
                    <IconComponent width="24" height="24" style={{ marginBottom: '4px' }} />
                    <span style={{ textAlign: 'center' }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mobile-loading">Chargement...</div>
          )}
        </nav>
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
          {isMairieUser && (
            <li>
              <Link
                href="/mairie/ma-mairie"
                className={`bottom-menu-link ${pathname === '/mairie/ma-mairie' ? 'active' : ''}`}
              >
                <BuildingLibraryIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Ma mairie
              </Link>
            </li>
          )}
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

