'use client'
 
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import SidebarMenu from '../components/SidebarMenu';
 
const inter = Inter({ subsets: ['latin'] });
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
 
}) {
  // Create QueryClient inside component to avoid hydration issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));
 
  const [isMobile, setIsMobile] = useState(false);
 
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
 
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
 
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  return (
    <html lang="fr" style={{ margin: 0, padding: 0, height: '100%', overflow: 'hidden' }}>
      <body className={inter.className} style={{ margin: 0, padding: 0, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <QueryClientProvider client={queryClient}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            height: '100vh',
            width: '100vw',
            margin: 0,
            padding: 0,
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            {!isMobile && <SidebarMenu />}
            <main style={{
              flex: 1,
              backgroundColor: '#f9fafb',
              padding: isMobile ? '24px 24px 94px 24px' : '24px', // Espace en bas pour la bottom bar mobile
              minWidth: 0,
              overflow: 'auto',
              height: isMobile ? 'calc(100% - 70px)' : '100%', // Réduire la hauteur sur mobile pour la bottom bar
              boxSizing: 'border-box'
            }}>
              {children}
            </main>
            {isMobile && <SidebarMenu />}
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
 