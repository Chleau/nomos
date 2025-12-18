'use client'

import { useRoleProtection } from '@/lib/hooks/useRoleProtection'
import { UserRole } from '@/types/auth'
import { ReactNode } from 'react'

interface RoleProtectedPageProps {
  children: ReactNode
  allowedRoles: UserRole[]
  loadingFallback?: ReactNode
}

export function RoleProtectedPage({
  children,
  allowedRoles,
  loadingFallback
}: RoleProtectedPageProps) {
  const { isAuthorized } = useRoleProtection(allowedRoles)

  if (!isAuthorized) {
    return loadingFallback || <div className="flex items-center justify-center min-h-screen">Vérification des permissions...</div>
  }

  return <>{children}</>
}
