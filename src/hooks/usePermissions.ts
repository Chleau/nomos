import { useCallback } from 'react';
import { Permission, UserPermissions, ROLE_PERMISSIONS } from '@/types/auth';

export function usePermissions(user: UserPermissions | null) {
    const checkPermission = useCallback((requiredPermission: Permission, communeId?: number): boolean => {
        // Si pas d'utilisateur, pas de permissions
        if (!user) return false;

        // Récupérer les permissions du rôle de l'utilisateur
        const userPermissions = ROLE_PERMISSIONS[user.role];

        // Vérifier si l'utilisateur a la permission requise
        const hasPermission = userPermissions.includes(requiredPermission);

        // Si pas de permission, retourner false
        if (!hasPermission) return false;

        // Pour le SUPER_ADMIN, accès à tout
        if (user.role === 'super_admin') return true;

        // Pour les autres rôles, vérifier la commune si nécessaire
        if (communeId && user.commune_id !== communeId) {
            return false;
        }

        return true;
    }, [user]);

    return {
        checkPermission,
        isAuthenticated: !!user,
        role: user?.role,
        communeId: user?.commune_id
    };
}
