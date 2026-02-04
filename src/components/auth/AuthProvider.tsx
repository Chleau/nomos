'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'

const PUBLIC_ROUTES = ['/signin', '/signup']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseAuth()
  const router = useRouter()
  const pathname = usePathname()
  const lastUserState = useRef<boolean | null>(null)

  useEffect(() => {
    if (loading) return

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
    const isCurrentlyLoggedIn = !!user

    // Si l'utilisateur n'est pas connecté et n'est pas sur une page publique
    if (!isCurrentlyLoggedIn && !isPublicRoute) {
      router.push('/signin')
    }

    // Si l'utilisateur est connecté et sur une page d'auth
    // MAIS seulement si l'utilisateur était précédemment déconnecté (pas une reconnexion instant)
    if (isCurrentlyLoggedIn && isPublicRoute) {
      // Vérifier que ce n'est pas un changement d'état immédiat après déconnexion
      if (lastUserState.current !== false) {
        router.push('/')
      }
    }

    // Tracker l'état de connexion
    lastUserState.current = isCurrentlyLoggedIn
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
