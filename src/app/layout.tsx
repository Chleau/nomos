import { Metadata } from 'next';
import ClientLayoutWrapper from '@/components/layout/ClientLayoutWrapper';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nomos - Gestion Municipale Moderne',
  description: 'Solution de gestion municipale pour fluidifier les échanges entre la mairie et ses administrés.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" style={{ margin: 0, padding: 0, height: '100dvh', overflow: 'hidden' }} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body style={{ margin: 0, padding: 0, height: '100dvh', boxSizing: 'border-box', overflow: 'hidden' }} suppressHydrationWarning>
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
