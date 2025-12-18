'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';

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
 
const menuItems = [
  { label: 'Accueil', href: '/', icon: '🏠' },
  { label: 'Carte des incidents', href: '/carte-incidents', icon: '🗺️' },
  { label: 'Accueil marie', href: '/mairie', icon: '🏛️' },
  { label: 'Dernières lois en vigueur', href: '/lois', icon: '⚖️' },
];
 
const mobileMenuItems = [
  { label: 'Accueil', href: '/', icon: '🏠' },
  { label: 'Carte incidents', href: '/carte-incidents', icon: '🗺️' },
  { label: 'Lois', href: '/lois', icon: '⚖️' },
  { label: 'Menu', href: '/mon-compte', icon: '☰' },
];
 
export default function SidebarMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const { user, loading, signOut } = useSupabaseAuth();
  const [habitantData, setHabitantData] = useState<any>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  // Charger les données de l'habitant depuis la table habitants
  useEffect(() => {
    async function loadHabitantData() {
      if (user) {
        const { data, error } = await fetch(`/api/habitants?auth_user_id=${user.id}`).then(res => res.json());
        if (!error && data && data.length > 0) {
          setHabitantData(data[0]);
        }
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
    return (
      <>
        {/* Bouton flottant "Signaler un incident" */}
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
       
        {/* Bottom Bar Navigation */}
        <nav style={bottomBarStyle}>
          {mobileMenuItems.map(item => (
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
                minWidth: '60px',
                fontSize: '12px',
                fontWeight: pathname === item.href ? '600' : '400'
              }}
            >
              <span style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</span>
              <span style={{ textAlign: 'center' }}>{item.label}</span>
            </Link>
          ))}
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
        <button style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          fontSize: '18px'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px' }}>
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Dernières déclaration d&apos;incidents
            </Link>
          </li>
        </ul>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="8" x2="12" y2="14"></line>
              <line x1="12" y1="17" x2="12" y2="18"></line>
            </svg>
            Signaler un incident
          </Link>
        </div>
      </nav>
      
      {/* Bas du menu */}
      <div style={{ marginTop: 'auto', paddingTop: '16px'}}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px' }}>
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              Paramètres
            </Link>
          </li>
          <li>
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="10" r="3"></circle>
                <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855"></path> 
              </svg>
              Mon compte
            </Link>
          </li>
        </ul>
      </div>
    </aside>
  );
}
 
 