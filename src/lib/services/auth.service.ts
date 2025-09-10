import { supabase } from '../supabase/client'
import { UserRole } from '@/types/auth'

export const authService = {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (error) {
        console.error('Sign in error:', error)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Unexpected error during sign in:', error)
      return { data: null, error: error as Error }
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  async signUp(data: {
    email: string
    password: string
    nom: string
    prenom: string
    commune_id: number
  }) {
    // Validation des données
    const email = data.email.trim().toLowerCase()
    if (!email || !email.includes('@')) {
      return { 
        data: null, 
        error: new Error('Adresse email invalide') 
      }
    }
    // Log des données pour le débogage
    console.log('Tentative d\'inscription avec les données:', {
      email: data.email,
      nom: data.nom,
      prenom: data.prenom,
      commune_id: data.commune_id
    })

    try {
      // Créer l'utilisateur dans Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nom: data.nom,
            prenom: data.prenom,
            commune_id: data.commune_id,
            role: UserRole.HABITANT
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        return { data: null, error: authError }
      }

      if (!authData.user) {
        console.error('No user data returned')
        return { data: null, error: new Error('No user data returned') }
      }

      // Créer l'entrée dans la table habitants
      const habitantData = {
        auth_user_id: authData.user.id,
        email: data.email.toLowerCase().trim(),
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        commune_id: data.commune_id,
        role: UserRole.HABITANT
      }

      console.log('Tentative d\'insertion dans habitants:', habitantData)

      const { error: profileError } = await supabase
        .from('habitants')
        .insert(habitantData)

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return { data: null, error: profileError }
      }

      return { data: authData, error: null }
    } catch (error) {
      console.error('Unexpected error:', error)
      return { data: null, error: error as Error }
    }

  },

  // Fin du service
}
