import { supabase } from '../supabase/client'
import { UserRole } from '@/types/auth'
import { logger } from '@/lib/logger'

export const authService = {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      if (error) {
        logger.error('Sign in error', error, { context: 'AuthService' })
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      logger.error('Unexpected error during sign in', error, { context: 'AuthService' })
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
        logger.error('Auth error', authError, { context: 'AuthService.signUp' })
        return { data: null, error: authError }
      }

      if (!authData.user) {
        logger.error('No user data returned', undefined, { context: 'AuthService.signUp' })
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

      logger.debug('Tentative d\'insertion dans habitants', habitantData, { context: 'AuthService.signUp' })

      const { error: profileError } = await supabase
        .from('habitants')
        .insert(habitantData)

      if (profileError) {
        logger.error('Profile creation error', profileError, { context: 'AuthService.signUp' })
        return { data: null, error: profileError }
      }

      return { data: authData, error: null }
    } catch (error) {
      logger.error('Unexpected error', error, { context: 'AuthService.signUp' })
      return { data: null, error: error as Error }
    }

  },

  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        logger.error('Password update error', error, { context: 'AuthService' })
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      logger.error('Unexpected error during password update', error, { context: 'AuthService' })
      return { data: null, error: error as Error }
    }
  }
}
