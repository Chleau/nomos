import { supabase } from '../supabase/client'
import { Habitant } from '@/types/habitants'

export const habitantsService = {
  async getAll(): Promise<{ data: Habitant[] | null; error: Error | null }> {
    console.log('Fetching habitants...')
    const { data, error } = await supabase
      .from('habitants')
      .select('*')
      .order('nom')
    
    console.log('Supabase response:', { data, error })
    return { data, error }
  },

  async getById(id: number): Promise<{ data: Habitant | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('habitants')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  async create(habitant: Omit<Habitant, 'id'>): Promise<{ data: Habitant | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('habitants')
      .insert(habitant)
      .select()
      .single()
    
    return { data, error }
  },

  async update(id: number, habitant: Partial<Habitant>): Promise<{ data: Habitant | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('habitants')
      .update(habitant)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  async delete(id: number): Promise<{ error: Error | null }> {
    const { error } = await supabase
      .from('habitants')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}
