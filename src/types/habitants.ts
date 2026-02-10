export type Habitant = {
  id: number
  created_at: string
  nom: string
  prenom: string
  commune_id: number
  email: string
  phone_number?: string
  auth_user_id?: string
  role?: string
}
