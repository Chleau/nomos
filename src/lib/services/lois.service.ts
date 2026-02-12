import { supabase } from '../supabase/client'
import type { LoiReglementation } from '@/types/entities'

export const loisService = {
  async getAll() {
    const { data, error } = await supabase
      .from('lois_reglementations')
      .select('*')
      .order('date_mise_a_jour', { ascending: false })

    return { data, error }
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('lois_reglementations')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  async getByThematique(thematique: string) {
    const { data, error } = await supabase
      .from('lois_reglementations')
      .select('*')
      .eq('thematique', thematique)
      .order('date_mise_a_jour', { ascending: false })

    return { data, error }
  },

  async search(searchTerm: string) {
    const { data, error } = await supabase
      .from('lois_reglementations')
      .select('*')
      .or(`titre.ilike.%${searchTerm}%,contenu.ilike.%${searchTerm}%,thematique.ilike.%${searchTerm}%`)
      .order('date_mise_a_jour', { ascending: false })

    return { data, error }
  }
}
