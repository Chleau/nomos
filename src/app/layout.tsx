'use client'

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import SidebarMenu from '../components/SidebarMenu';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { HabitantProvider } from '@/lib/contexts/HabitantContext';
import './globals.css';

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
  const pathname = usePathname();

  // Vérifier si on est sur une page d'authentification
  const isAuthPage = pathname === '/signin' || pathname === '/signup';

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <html lang="fr" style={{ margin: 0, padding: 0, height: '100%', overflow: 'hidden' }} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body style={{ margin: 0, padding: 0, height: '100%', boxSizing: 'border-box', overflow: 'hidden' }} suppressHydrationWarning>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <HabitantProvider>
              {isAuthPage ? (
                // Layout simple pour les pages d'authentification
                <div className="min-h-screen bg-gray-50">
                  {children}
                </div>
              ) : (
                // Layout avec sidebar pour les pages protégées
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  height: isMobile ? '100dvh' : '100vh',
                  width: '100vw',
                  margin: 0,
                  padding: 0,
                  overflow: 'hidden',
                  boxSizing: 'border-box'
                }}>
                  {!isMobile && <SidebarMenu />}
                  <main style={{
                    flex: 1,
                    backgroundColor: '#F5FCFE',
                    paddingTop: isMobile ? 'env(safe-area-inset-top)' : 0,
                    paddingLeft: 'env(safe-area-inset-left)',
                    paddingRight: 'env(safe-area-inset-right)',
                    paddingBottom: isMobile ? 'calc(120px + env(safe-area-inset-bottom))' : '24px',
                    minWidth: 0,
                    overflowY: 'auto',
                    boxSizing: 'border-box'
                  }}>
                    {children}
                  </main>
                  {isMobile && <SidebarMenu />}
                </div>
              )}
            </HabitantProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
