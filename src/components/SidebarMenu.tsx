import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { label: 'Accueil', href: '/', icon: '🏠' },
  { label: 'Carte des incidents', href: '/carte-incidents', icon: '🗺️' },
  { label: 'Dernières lois en vigueur', href: '/lois', icon: '⚖️' },
];

export default function SidebarMenu() {
  const pathname = usePathname();
  
  const sidebarStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    width: '25vw',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '16px',
    position: 'fixed' as const,
    left: 0,
    top: 0
  };

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
        <div style={{ fontSize: '18px', fontWeight: '600' }}>Nicolas Moreau</div>
        <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Habitant</div>
        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
          Commune<br/>Romorantin-Lanthenay
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
            width: '100%',
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
          <li>
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
        </ul>
      </div>
    </aside>
  );
}
