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
    <html lang="fr">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <SidebarMenu />
            <main style={{ flex: 1, backgroundColor: '#f9fafb', padding: '24px', marginLeft: '256px' }}>{children}</main>
          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}