'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
 
const menuItems = [
  { label: 'Accueil', href: '/', icon: '🏠' },
  { label: 'Carte des incidents', href: '/carte-incidents', icon: '🗺️' },
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

  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };
 
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
    height: '100%',
    width: '20vw',
    minWidth: '20vw',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '16px',
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
            backgroundColor: '#ea580c',
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
      {/* Profil */}
      <div style={{
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        marginBottom: '32px',
        marginTop: '8px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#d1d5db',
          marginBottom: '8px'
        }} />
        <div style={{ fontSize: '18px', fontWeight: '600' }}>
          {user?.user_metadata?.prenom || 'Utilisateur'} {user?.user_metadata?.nom || ''}
        </div>
        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
          {user?.user_metadata?.role || 'Habitant'}
        </div>
        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px', textAlign: 'center' }}>
          {user?.email}
        </div>
      </div>
      {/* Menu principal */}
      <nav style={{ flex: 1 }}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {menuItems.map(item => (
            <li key={item.href} style={{ marginBottom: '8px' }}>
              <Link href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                backgroundColor: pathname === item.href ? 'white' : 'transparent',
                color: pathname === item.href ? '#1e293b' : 'white'
              }}>
                <span style={{ marginRight: '12px', fontSize: '18px' }}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div style={{ marginTop: '24px' }}>
          <Link href="/signaler-incident" style={{
            // width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ea580c',
            color: 'white',
            fontWeight: '600',
            padding: '12px',
            borderRadius: '6px',
            textDecoration: 'none'
          }}>
            <span style={{ marginRight: '8px' }}>⚠️</span> Signaler un incident
          </Link>
        </div>
      </nav>
      {/* Bas du menu */}
      <div style={{ marginTop: 'auto', marginBottom: '8px' }}>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          <li style={{ marginBottom: '8px' }}>
            <Link href="/parametres" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'white'
            }}>
              <span style={{ marginRight: '12px' }}>⚙️</span> Paramètres
            </Link>
          </li>
          <li style={{ marginBottom: '8px' }}>
            <Link href="/mon-compte" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: 'white'
            }}>
              <span style={{ marginRight: '12px' }}>👤</span> Mon compte
            </Link>
          </li>
          <li>
            <button 
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: 'white',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                fontSize: '14px'
              }}
            >
              <span style={{ marginRight: '12px' }}>🚪</span> Déconnexion
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
 
 