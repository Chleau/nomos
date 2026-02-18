export interface Signalement {
  id: number
  titre: string
  created_at?: string
  habitant_id?: number
  commune_id?: number
  agent_id?: number
  description?: string
  latitude?: number
  longitude?: number
  type_id?: number
  priorite?: string
  statut?: string
  date_signalement?: string
  date_dernier_suivi?: string
  valide?: boolean
  valide_par?: number
  date_validation?: string
  url?: string
  nom?: string
  prenom?: string
  telephone?: string
  email?: string
  photos_signalement?: { id: number; url: string }[]
  types_signalement?: { id: number; libelle: string }
  habitants?: { id: number; nom: string; prenom: string; email: string; telephone: string }
  agents_mairie?: { id: number; nom: string; prenom: string; email: string }
  validateur?: { id: number; nom: string; prenom: string; email: string }
}
