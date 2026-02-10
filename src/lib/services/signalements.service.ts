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
  async update(signalementId: number, updates: Partial<Signalement>) {
    const { data, error } = await supabase
      .from('signalements')
      .update(updates)
      .eq('id', signalementId)
      .select()
      .single();
    return { data, error };
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
        ),
        types_signalement (
          id,
          libelle
        ),
        habitants (
          id,
          nom,
          prenom
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
        ),
        types_signalement (
          id,
          libelle
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
        ),
        types_signalement (
          id,
          libelle
        )
      `)
      .eq('id', id)
      .single()
    return { data, error }
  },

  async getCountByCommune(communeId: number) {
    const { count, error } = await supabase
      .from('signalements')
      .select('*', { count: 'exact', head: true })
      .eq('commune_id', communeId)
    
    return { data: count || 0, error }
  }
}
