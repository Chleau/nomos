'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'

const PUBLIC_ROUTES = ['/signin', '/signup']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))

    // Si l'utilisateur n'est pas connecté et n'est pas sur une page publique
    if (!user && !isPublicRoute) {
      router.push('/signin')
    }

    // Si l'utilisateur est connecté et sur une page d'auth, le rediriger vers l'accueil
    if (user && isPublicRoute) {
      router.push('/')
    }
  }, [user, loading, pathname, router])

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
