'use client'

import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Permission } from '@/types/auth';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPermission: Permission;
    communeId?: number;
    fallbackUrl?: string;
}

export function ProtectedRoute({ 
    children, 
    requiredPermission, 
    communeId,
    fallbackUrl = '/'
}: ProtectedRouteProps) {
    const router = useRouter();
    const { checkPermission, isAuthenticated } = usePermissions(null); // Remplacer null par l'utilisateur actuel

    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    if (!checkPermission(requiredPermission, communeId)) {
        router.push(fallbackUrl);
        return null;
    }

    return <>{children}</>;
}
