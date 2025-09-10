type Database = any;

import { 
    AgentMairie, 
    Habitant, 
    Signalement, 
    ArreteMunicipal,
    LoiReglementation,
    Gamification,
    Badge,
    PhotoSignalement,
    TypeSignalement 
} from './entities';

export interface CustomDatabase extends Database {
    public: {
        Tables: {
            agents_mairie: {
                Row: AgentMairie;
                Insert: Omit<AgentMairie, 'id' | 'created_at'>;
                Update: Partial<Omit<AgentMairie, 'id' | 'created_at'>>;
            };
            habitants: {
                Row: Habitant;
                Insert: Omit<Habitant, 'id' | 'created_at'>;
                Update: Partial<Omit<Habitant, 'id' | 'created_at'>>;
            };
            signalements: {
                Row: Signalement;
                Insert: Omit<Signalement, 'id' | 'created_at'>;
                Update: Partial<Omit<Signalement, 'id' | 'created_at'>>;
            };
            arretes_municipaux: {
                Row: ArreteMunicipal;
                Insert: Omit<ArreteMunicipal, 'id' | 'created_at'>;
                Update: Partial<Omit<ArreteMunicipal, 'id' | 'created_at'>>;
            };
            lois_reglementations: {
                Row: LoiReglementation;
                Insert: Omit<LoiReglementation, 'id' | 'created_at'>;
                Update: Partial<Omit<LoiReglementation, 'id' | 'created_at'>>;
            };
            gamification: {
                Row: Gamification;
                Insert: Omit<Gamification, 'id' | 'created_at'>;
                Update: Partial<Omit<Gamification, 'id' | 'created_at'>>;
            };
            badges: {
                Row: Badge;
                Insert: Omit<Badge, 'id' | 'created_at'>;
                Update: Partial<Omit<Badge, 'id' | 'created_at'>>;
            };
            photos_signalement: {
                Row: PhotoSignalement;
                Insert: Omit<PhotoSignalement, 'id' | 'created_at'>;
                Update: Partial<Omit<PhotoSignalement, 'id' | 'created_at'>>;
            };
            types_signalement: {
                Row: TypeSignalement;
                Insert: Omit<TypeSignalement, 'id' | 'created_at'>;
                Update: Partial<Omit<TypeSignalement, 'id' | 'created_at'>>;
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
    };
}
