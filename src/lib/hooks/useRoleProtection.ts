import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth'
import { UserRole } from '@/types/auth'
import { useEffect, useState } from 'react'
import { useCurrentHabitant } from './useHabitants'

export function useRoleProtection(allowedRoles: UserRole[]) {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabaseAuth()
  const { data: habitant, isLoading: habitantLoading } = useCurrentHabitant(user?.id || null)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (authLoading || habitantLoading) return

    if (!user) {
      router.push('/signin')
      return
    }

    // Déterminer le rôle de l'utilisateur
    const userRole = habitant?.role as UserRole

    // SUPER_ADMIN a accès à tout
    if (userRole === UserRole.SUPER_ADMIN) {
      setIsAuthorized(true)
      return
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
      // Rediriger vers la page appropriée selon le rôle
      if (userRole === UserRole.ADMIN || userRole === UserRole.MAIRIE) {
        router.push('/mairie')
      } else {
        router.push('/')
      }
      return
    }

    setIsAuthorized(true)
  }, [user, authLoading, habitantLoading, habitant?.role, allowedRoles, router])

  return { isAuthorized, user, habitant }
}
