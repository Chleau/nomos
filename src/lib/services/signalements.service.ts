import { supabase } from '../supabase/client'
import type { Signalement } from '@/types/signalements'

export const signalementsService = {
  async create(signalement: Omit<Signalement, 'id' | 'created_at' | 'date_signalement' | 'date_dernier_suivi' | 'date_validation'>) {
    const { data, error } = await supabase
      .from('signalements')
      .insert(signalement)
      .select()
      .single()
    return { data, error }
  },
  // Tu pourras ajouter getAll, update, delete plus tard
}
