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
  async updateUrl(signalementId: number, url: string) {
    const { data, error } = await supabase
      .from('signalements')
      .update({ url })
      .eq('id', signalementId)
      .select()
      .single();
    return { data, error };
  },
  async getAll(limit?: number) {
    let query = supabase
      .from('signalements')
      .select(`
        *,
        photos_signalement (
          id,
          url
        )
      `)
      .order('date_signalement', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    return { data, error }
  },
  async getByHabitant(habitantId: number, limit?: number) {
    let query = supabase
      .from('signalements')
      .select(`
        *,
        photos_signalement (
          id,
          url
        )
      `)
      .eq('habitant_id', habitantId)
      .order('date_signalement', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    return { data, error }
  },
  async getById(id: number) {
    const { data, error } = await supabase
      .from('signalements')
      .select(`
        *,
        photos_signalement (
          id,
          url
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  }
}
