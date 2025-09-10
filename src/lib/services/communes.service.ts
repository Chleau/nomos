import { supabase } from '../supabase/client'

interface Commune {
  id: number
  nom: string
  code_postal: string
  departement: string
}

export const communeService = {
  async getAll(): Promise<{ data: Commune[] | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('communes')
      .select('*')
      .order('nom')
    
    return { data, error }
  },

  async getById(id: number): Promise<{ data: Commune | null; error: Error | null }> {
    const { data, error } = await supabase
      .from('communes')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  }
}
