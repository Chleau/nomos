// Types de rôles disponibles
export enum UserRole {
    HABITANT = 'habitant',
    AGENT_BASIQUE = 'agent_basique',         // Peut gérer les signalements uniquement
    AGENT_REDACTEUR = 'agent_redacteur',     // Peut gérer les signalements et rédiger des arrêtés
    ADMIN_MAIRIE = 'admin_mairie',           // Accès complet pour sa mairie
    SUPER_ADMIN = 'super_admin'              // Accès complet sur toutes les mairies
}

// Permissions possibles dans l'application
export enum Permission {
    // Signalements
    VOIR_SIGNALEMENTS = 'voir_signalements',
    CREER_SIGNALEMENT = 'creer_signalement',
    GERER_SIGNALEMENTS = 'gerer_signalements',
    VALIDER_SIGNALEMENTS = 'valider_signalements',

    // Arrêtés
    VOIR_ARRETES = 'voir_arretes',
    CREER_ARRETE = 'creer_arrete',
    MODIFIER_ARRETE = 'modifier_arrete',
    SUPPRIMER_ARRETE = 'supprimer_arrete',

    // Agents
    GERER_AGENTS = 'gerer_agents',

    // Habitants
    GERER_HABITANTS = 'gerer_habitants',

    // Administration
    ADMIN_MAIRIE = 'admin_mairie',
    SUPER_ADMIN = 'super_admin'
}

// Mapping des permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    [UserRole.HABITANT]: [
        Permission.VOIR_SIGNALEMENTS,
        Permission.CREER_SIGNALEMENT,
        Permission.VOIR_ARRETES
    ],
    
    [UserRole.AGENT_BASIQUE]: [
        Permission.VOIR_SIGNALEMENTS,
        Permission.CREER_SIGNALEMENT,
        Permission.GERER_SIGNALEMENTS,
        Permission.VALIDER_SIGNALEMENTS,
        Permission.VOIR_ARRETES,
        Permission.GERER_HABITANTS
    ],
    
    [UserRole.AGENT_REDACTEUR]: [
        Permission.VOIR_SIGNALEMENTS,
        Permission.CREER_SIGNALEMENT,
        Permission.GERER_SIGNALEMENTS,
        Permission.VALIDER_SIGNALEMENTS,
        Permission.VOIR_ARRETES,
        Permission.CREER_ARRETE,
        Permission.MODIFIER_ARRETE,
        Permission.GERER_HABITANTS
    ],
    
    [UserRole.ADMIN_MAIRIE]: [
        Permission.VOIR_SIGNALEMENTS,
        Permission.CREER_SIGNALEMENT,
        Permission.GERER_SIGNALEMENTS,
        Permission.VALIDER_SIGNALEMENTS,
        Permission.VOIR_ARRETES,
        Permission.CREER_ARRETE,
        Permission.MODIFIER_ARRETE,
        Permission.SUPPRIMER_ARRETE,
        Permission.GERER_AGENTS,
        Permission.GERER_HABITANTS,
        Permission.ADMIN_MAIRIE
    ],
    
    [UserRole.SUPER_ADMIN]: [
        Permission.VOIR_SIGNALEMENTS,
        Permission.CREER_SIGNALEMENT,
        Permission.GERER_SIGNALEMENTS,
        Permission.VALIDER_SIGNALEMENTS,
        Permission.VOIR_ARRETES,
        Permission.CREER_ARRETE,
        Permission.MODIFIER_ARRETE,
        Permission.SUPPRIMER_ARRETE,
        Permission.GERER_AGENTS,
        Permission.GERER_HABITANTS,
        Permission.ADMIN_MAIRIE,
        Permission.SUPER_ADMIN
    ]
}

// Type pour vérifier les permissions d'un utilisateur
export interface UserPermissions {
    role: UserRole;
    commune_id?: number;  // undefined pour SUPER_ADMIN (accès à toutes les communes)
}

// Hook personnalisé pour vérifier les permissions (à implémenter)
export type CheckPermission = (permission: Permission, communeId?: number) => boolean;
