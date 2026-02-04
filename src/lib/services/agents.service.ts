import { supabase } from '../supabase/client'
import { AgentMairie, Habitant } from '@/types/entities'

export const agentsService = {
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('agents_mairie')
      .select('*')
      .eq('email', email)
      .maybeSingle()
    return { data, error }
  },

  async createFromHabitant(habitant: Habitant) {
    // On prépare les données de l'agent à partir de l'habitant
    const newAgent = {
      nom: habitant.nom,
      prenom: habitant.prenom,
      email: habitant.email,
      commune_id: habitant.commune_id,
      role: habitant.role // On assume que l'habitant a déjà le bon role (MAIRIE/ADMIN)
    }

    const { data, error } = await supabase
      .from('agents_mairie')
      .insert(newAgent)
      .select()
      .single()

    return { data, error }
  },

  async getOrCreateAgentFromHabitant(habitant: Habitant) {
      if (!habitant.email) return { data: null, error: new Error("Habitant sans email") }

      // 1. Chercher si l'agent existe déjà par email
      const { data: existingAgent } = await this.getByEmail(habitant.email)
      
      if (existingAgent) {
          return { data: existingAgent, error: null }
      }

      // 2. Sinon, le créer
      const { data: newAgent, error } = await this.createFromHabitant(habitant)
      return { data: newAgent, error }
  }
}
