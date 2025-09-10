// Types communs
export type Timestamp = string;

// Type de base avec les champs communs
export interface BaseEntity {
    id: number;
    created_at: Timestamp;
}

import { UserRole } from './auth';

// Types pour les agents de la mairie
export interface AgentMairie extends BaseEntity {
    nom: string;
    prenom: string;
    email: string;
    commune_id: number;
    role: UserRole;
}

// Types pour les habitants
export interface Habitant extends BaseEntity {
    nom: string;
    prenom: string;
    email: string;
    commune_id: number;
    role: UserRole.HABITANT;
}

// Types pour les signalements
export interface Signalement extends BaseEntity {
    habitant_id: number;
    commune_id: number;
    agent_id: number | null;
    titre: string;
    description: string | null;
    latitude: number;
    longitude: number;
    type_id: number;
    priorite: 'basse' | 'moyenne' | 'haute';
    statut: 'ouvert' | 'en_cours' | 'resolu' | 'archive';
    date_signalement: Timestamp;
    date_dernier_suivi: Timestamp | null;
    valide: boolean;
    valide_par: number | null;
    date_validation: Timestamp | null;
}

// Types pour les types de signalement
export interface TypeSignalement extends BaseEntity {
    libelle: string;
}

// Types pour les arrêtés municipaux
export interface ArreteMunicipal extends BaseEntity {
    commune_id: number;
    agent_id: number;
    titre: string;
    contenu: string;
    date_creation: Timestamp;
    date_modification: Timestamp | null;
    fichier_url: string | null;
    archive: boolean;
}

// Types pour les lois et réglementations
export interface LoiReglementation extends BaseEntity {
    titre: string;
    contenu: string;
    thematique: string;
    date_mise_a_jour: Timestamp;
}

// Types pour la gamification
export interface Gamification extends BaseEntity {
    habitant_id: number;
    points: number;
    date_dernier_update: Timestamp;
}

// Types pour les badges
export interface Badge extends BaseEntity {
    nom: string;
    description: string | null;
    icone_url: string | null;
}

// Types pour les photos de signalement
export interface PhotoSignalement extends BaseEntity {
    signalement_id: number;
    url: string;
}

// Types pour les réponses API
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

// Types pour les filtres et la pagination
export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface SignalementFilters extends PaginationParams {
    commune_id?: number;
    type_id?: number;
    statut?: Signalement['statut'];
    priorite?: Signalement['priorite'];
    date_debut?: string;
    date_fin?: string;
}

export interface ArreteFilters extends PaginationParams {
    commune_id?: number;
    archive?: boolean;
    date_debut?: string;
    date_fin?: string;
    recherche?: string;
}
