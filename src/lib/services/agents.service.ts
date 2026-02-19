import { supabase } from '../supabase/client'
import { AgentMairie, Habitant } from '@/types/entities'

import { UserRole } from '@/types/auth'

export const agentsService = {
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('habitants')
      .select('*')
      .eq('email', email)
      .in('role', [UserRole.MAIRIE, UserRole.ADMIN])
      .maybeSingle()
    return { data, error }
  },

  async getByCommune(communeId: number) {
    const { data, error } = await supabase
      .from('habitants')
      .select('*')
      .eq('commune_id', communeId)
      .in('role', [UserRole.MAIRIE, UserRole.ADMIN])
    return { data, error }
  },

  async getOrCreateAgentFromHabitant(habitant: Habitant) {
    // Dans le nouveau modèle, l'agent EST l'habitant.
    // On retourne simplement l'habitant.
    return { data: habitant, error: null }
  }
}
