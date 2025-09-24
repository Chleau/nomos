'use client'


import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import SidebarMenu from '../components/SidebarMenu';

const inter = Inter({ subsets: ['latin'] });
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  
}) {
  return (
    <html lang="fr" style={{ margin: 0, padding: 0, height: '100%' }}>
      <body className={inter.className} style={{ margin: 0, padding: 0, height: '100%', boxSizing: 'border-box' }}>
        <QueryClientProvider client={queryClient}>
          <div style={{ display: 'flex', minHeight: '100vh', width: '100%', margin: 0, padding: 0 }}>
            <SidebarMenu />
            <main style={{ 
              flex: 1, 
              backgroundColor: '#f9fafb', 
              padding: '24px',
              minWidth: 0,
              overflow: 'auto'
            }}>
              {children}
            </main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}