'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
import { useHabitants } from '@/lib/hooks/useHabitants';
import { UserRole } from '@/types/auth';
import {
  HomeIcon,
  MapIcon,
  DocumentTextIcon,
  ClockIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
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

// Styles CSS pour le hover
const menuItemStyles = `
  .menu-item-link {
    position: relative;
    transition: all 0.3s ease !important;
  }
  .menu-item-link svg,
  .menu-item-link span {
    transition: all 0.3s ease !important;
  }
  .menu-item-link:hover:not(.active) {
    color: #F27F09 !important;
    transform: translateX(8px) !important;
  }
  .menu-item-link:hover:not(.active) svg {
    color: #F27F09 !important;
  }
  .menu-item-link::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%) scaleX(0);
    transform-origin: left;
    width: 5px;
    height: 50%;
    background-color: #F27F09;
    border-radius: 4px 4px;
    transition: transform 0.3s ease;
  }
  .menu-item-link:hover:not(.active)::before {
    transform: translateY(-50%) scaleX(1);
  }
  .bottom-menu-link {
    transition: color 0.3s ease !important;
  }
  .bottom-menu-link svg {
    transition: color 0.3s ease !important;
  }
  .bottom-menu-link:hover {
    color: #F27F09 !important;
  }
  .bottom-menu-link:hover svg {
    color: #F27F09 !important;
  }
`;
 
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
  const { user, loading, signOut } = useSupabaseAuth();
  const [habitantData, setHabitantData] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(false);

  // Déterminer le rôle de l'utilisateur - attendre que habitantData soit chargé
  const userRole = habitantData?.role as UserRole;
  const isMairieUser = habitantData ? [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MAIRIE
  ].includes(userRole) : false;

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

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
 
  // Style pour la sidebar desktop (gauche)
  const sidebarStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    width: '20vw',
    minWidth: '280px',
    backgroundColor: '#053F5C',
    color: 'white',
    padding: '24px 16px',
    position: 'sticky' as const,
    top: 0,
    flexShrink: 0,
    boxSizing: 'border-box' as const
  };
 
  // Style pour la bottom bar mobile
  const bottomBarStyle = {
    display: 'flex',
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '70px',
    backgroundColor: '#1e293b',
    color: 'white',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTop: '1px solid #334155',
    zIndex: 1000,
    boxSizing: 'border-box' as const
  };
 
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
            style={{
              position: 'fixed' as const,
              bottom: '90px', // Au-dessus de la bottom bar (70px + 20px de marge)
              right: '20px',
              width: '60px',
              height: '60px',
              backgroundColor: '#F27F09',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: 'white',
              fontSize: '24px',
              boxShadow: '0 4px 20px rgba(234, 88, 12, 0.4)',
              zIndex: 1001,
              transition: 'all 0.3s ease',
              transform: pathname === '/signaler-incident' ? 'scale(1.1)' : 'scale(1)',
              border: '3px solid white'
            }}
          >
            ⚠️
          </Link>
        )}
       
        {/* Bottom Bar Navigation - Scrollable horizontally */}
        <nav style={{
          ...bottomBarStyle,
          overflowX: 'auto' as const,
          overflowY: 'hidden' as const
        }}>
          {dataLoaded ? (
            <div style={{ display: 'flex', gap: '4px', padding: '0 8px', minWidth: 'min-content' }}>
              {filteredMobileItems.map(item => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: pathname === item.href ? '#f97316' : 'white',
                      backgroundColor: pathname === item.href ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                      minWidth: '70px',
                      fontSize: '11px',
                      fontWeight: pathname === item.href ? '600' : '400',
                      whiteSpace: 'nowrap' as const,
                      flexShrink: 0
                    }}
                  >
                    <IconComponent width="24" height="24" style={{ marginBottom: '4px' }} />
                    <span style={{ textAlign: 'center' }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Chargement...</div>
          )}
        </nav>
      </>
    );
  }
 
  // Sidebar desktop (code existant)
 
  return (
    <aside style={sidebarStyle}>
      <style>{menuItemStyles}</style>
      {/* Profil */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        // paddingBottom: '24px',
        // borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: '#FEF0E3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          fontWeight: '700',
          color: '#F27F09',
          border: '2px solid #F27F09',
          flexShrink: 0
        }}>
          {habitantData?.prenom?.[0]?.toUpperCase() || user?.user_metadata?.prenom?.[0]?.toUpperCase()}{habitantData?.nom?.[0]?.toUpperCase() || user?.user_metadata?.nom?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '19px', fontWeight: '600', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {habitantData?.prenom || user?.user_metadata?.prenom} {habitantData?.nom || user?.user_metadata?.nom}
          </div>
          <div style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.8)' }}>
            {habitantData?.role || user?.user_metadata?.role || 'Habitant'}
          </div>
        </div>
        <button 
          onClick={() => setNotificationsMuted(!notificationsMuted)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '18px',
            transition: 'color 0.3s ease'
          }}
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
      <div style={{
        marginBottom: '32px',
        paddingBottom: '32px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px' }}>
          Commune
        </div>
        <div style={{ fontSize: '14px', fontWeight: '500' }}>
          {habitantData?.communes?.nom || user?.user_metadata?.commune}
        </div>
      </div>

      {/* Menu principal */}
      <nav style={{ flex: 1 }}>
        {!dataLoaded ? (
          // Afficher un message de chargement pendant le chargement des données
          <div style={{ padding: '16px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
            <p>Chargement du menu...</p>
          </div>
        ) : isMairieUser ? (
          // Menu pour les utilisateurs mairie
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            <li style={{ marginBottom: '4px' }}>
              <Link href="/mairie" className={`menu-item-link ${pathname === '/mairie' ? 'active' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: pathname === '/mairie' ? '#F27F09' : 'transparent',
                color: pathname === '/mairie' ? 'black' : 'white',
                fontSize: '15px',
                transition: 'background-color 0.2s',
                fontWeight: pathname === '/mairie' ? '600' : '400'
              }}>
                <HomeIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Accueil
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link href="/mairie/derniere-lois-en-vigueur" className={`menu-item-link ${pathname === '/mairie/derniere-lois-en-vigueur' ? 'active' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: pathname === '/mairie/derniere-lois-en-vigueur' ? '#F27F09' : 'transparent',
                color: pathname === '/mairie/derniere-lois-en-vigueur' ? 'black' : 'white',
                fontSize: '15px',
                transition: 'background-color 0.2s',
                fontWeight: pathname === '/mairie/derniere-lois-en-vigueur' ? '600' : '400'
              }}>
                <DocumentTextIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Dernière lois en vigueur
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link href="/mairie/dernieres-redactions" className={`menu-item-link ${pathname === '/mairie/dernieres-redactions' ? 'active' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: pathname === '/mairie/dernieres-redactions' ? '#F27F09' : 'transparent',
                color: pathname === '/mairie/dernieres-redactions' ? 'black' : 'white',
                fontSize: '15px',
                transition: 'background-color 0.2s',
                fontWeight: pathname === '/mairie/dernieres-redactions' ? '600' : '400'
              }}>
                <InboxIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Mes rédactions
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link href="/mairie/archives" className={`menu-item-link ${pathname === '/mairie/archives' ? 'active' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: pathname === '/mairie/archives' ? '#F27F09' : 'transparent',
                color: pathname === '/mairie/archives' ? 'black' : 'white',
                fontSize: '15px',
                transition: 'background-color 0.2s',
                fontWeight: pathname === '/mairie/archives' ? '600' : '400'
              }}>
                <FolderIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Archives
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link href="/mairie/signalement-habitants" className={`menu-item-link ${pathname === '/mairie/signalement-habitants' ? 'active' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: pathname === '/mairie/signalement-habitants' ? '#F27F09' : 'transparent',
                color: pathname === '/mairie/signalement-habitants' ? 'black' : 'white',
                fontSize: '15px',
                transition: 'background-color 0.2s',
                fontWeight: pathname === '/mairie/signalement-habitants' ? '600' : '400'
              }}>
                <MapPinIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Signalement des habitants
              </Link>
            </li>
          </ul>
        ) : (
          // Menu pour les habitants
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            <li style={{ marginBottom: '4px' }}>
              <Link href="/" className={`menu-item-link ${pathname === '/' ? 'active' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: pathname === '/' ? '#F27F09' : 'transparent',
                color: pathname === '/' ? 'black' : 'white',
                fontSize: '15px',
                transition: 'background-color 0.2s',
                fontWeight: pathname === '/' ? '600' : '400'
              }}>
                <HomeIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Accueil
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link href="/carte-incidents" className={`menu-item-link ${pathname === '/carte-incidents' ? 'active' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: pathname === '/carte-incidents' ? '#F27F09' : 'transparent',
                color: pathname === '/carte-incidents' ? 'black' : 'white',
                fontSize: '15px',
                transition: 'background-color 0.2s',
                fontWeight: pathname === '/carte-incidents' ? '600' : '400'
              }}>
                <MapIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Carte des incidents
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link href="/lois" className={`menu-item-link ${pathname === '/lois' ? 'active' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: pathname === '/lois' ? '#F27F09' : 'transparent',
                color: pathname === '/lois' ? 'black' : 'white',
                fontSize: '15px',
                transition: 'background-color 0.2s',
                fontWeight: pathname === '/lois' ? '600' : '400'
              }}>
                <NewspaperIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Dernières lois en vigueur
              </Link>
            </li>
            <li style={{ marginBottom: '4px' }}>
              <Link href="/signalements" className={`menu-item-link ${pathname === '/signalements' ? 'active' : ''}`} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: pathname === '/signalements' ? '#F27F09' : 'transparent',
                color: pathname === '/signalements' ? 'black' : 'white',
                fontSize: '15px',
                transition: 'background-color 0.2s',
                fontWeight: pathname === '/signalements' ? '600' : '400'
              }}>
                <PlusCircleIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Dernières déclarations d'incidents
              </Link>
            </li>
          </ul>
        )}
        {dataLoaded && !isMairieUser && (
          <div style={{ marginTop: '24px' }}>
            <Link href="/signaler-incident" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#F27F09',
              color: 'black',
              fontWeight: '600',
              fontSize: '15px',
              padding: '12px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
            }}>
              <ExclamationTriangleIcon width="24" height="24" />
              Signaler un incident
            </Link>
          </div>
        )}
        {dataLoaded && isMairieUser && (
          <div style={{ marginTop: '24px' }}>
            <Link href="/signaler-incident" style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#F27F09',
              color: 'black',
              fontWeight: '600',
              fontSize: '15px',
              padding: '12px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)'
            }}>
              <PencilSquareIcon width="24" height="24" />
              Nouvelle rédaction
            </Link>
          </div>
        )}
      </nav>
      
      {/* Bas du menu */}
      <div style={{ marginTop: 'auto', paddingTop: '16px'}}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {isMairieUser && (
            <li style={{ marginBottom: '4px' }}>
              <Link href="/mairie/ma-mairie" className="bottom-menu-link" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: pathname === '/mairie/ma-mairie' ? '#F27F09' : 'white',
                fontSize: '15px',
                transition: 'color 0.2s',
                fontWeight: pathname === '/mairie/ma-mairie' ? '600' : '400'
              }}>
                <BuildingLibraryIcon width="24" height="24" style={{ marginRight: '12px' }} />
                Ma mairie
              </Link>
            </li>
          )}
          <li style={{ marginBottom: '4px' }}>
            <Link href="/parametres" className="bottom-menu-link" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: pathname === '/parametres' ? '#F27F09' : 'white',
              fontSize: '15px',
              transition: 'color 0.2s',
              fontWeight: pathname === '/parametres' ? '600' : '400'
            }}>
              <Cog6ToothIcon width="24" height="24" style={{ marginRight: '12px' }} />
              Paramètres
            </Link>
          </li>
          <li style={{ marginBottom: '4px' }}>
            <Link href="/mon-compte" className="bottom-menu-link" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              color: pathname === '/mon-compte' ? '#F27F09' : 'white',
              fontSize: '15px',
              transition: 'color 0.2s',
              fontWeight: pathname === '/mon-compte' ? '600' : '400'
            }}>
              <UserIcon width="24" height="24" style={{ marginRight: '12px' }} />
              Mon compte
            </Link>
          </li>
          <li>
            <button
              onClick={() => {
                signOut?.()
                router.push('/signin')
              }}
              className="bottom-menu-link"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'white',
                fontSize: '15px',
                transition: 'color 0.2s',
                fontWeight: '400',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}>
              <ArrowLeftOnRectangleIcon width="24" height="24" style={{ marginRight: '12px' }} />
              Se déconnecter
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
 
 