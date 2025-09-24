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
}
