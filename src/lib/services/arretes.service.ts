import { supabase } from '../supabase/client'
import type { ArreteMunicipal } from '@/types/entities'

export const arretesService = {
  async getAll(communeId: number | null) {
    let query = supabase
      .from('arretes_municipaux')
      .select(`
        *,
        agents_mairie (
          id,
          nom,
          prenom
        )
      `)
      .order('date_creation', { ascending: false })

    if (communeId) {
      query = query.eq('commune_id', communeId)
    }

    const { data, error } = await query
    return { data, error }
  },

  async getRecent(communeId: number | null, limit: number = 5) {
    let query = supabase
      .from('arretes_municipaux')
      .select(`
        *,
        agents_mairie (
          id,
          nom,
          prenom
        )
      `)
      .order('date_creation', { ascending: false })
      .eq('archive', false)
      .limit(limit)

    if (communeId) {
      query = query.eq('commune_id', communeId)
    }

    const { data, error } = await query
    return { data, error }
  },

  async create(arrete: Partial<ArreteMunicipal>) {
    const { data, error } = await supabase
      .from('arretes_municipaux')
      .insert(arrete)
      .select()
      .single()

    return { data, error }
  },

  async update(id: string | number, updates: Partial<ArreteMunicipal>) {
    const { data, error } = await supabase
      .from('arretes_municipaux')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  async delete(id: string | number) {
    const { error } = await supabase
      .from('arretes_municipaux')
      .delete()
      .eq('id', id)
    return { error }
  },

  async getById(id: string | number) {
    const { data, error } = await supabase
      .from('arretes_municipaux')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async search(query: string, communeId?: number | null) {
    let supabaseQuery = supabase
      .from('arretes_municipaux')
      .select(`
        *,
        agents_mairie (
          id,
          nom,
          prenom
        )
      `)
      .order('date_creation', { ascending: false })

    if (communeId) {
      supabaseQuery = supabaseQuery.eq('commune_id', communeId)
    }

    const { data, error } = await supabaseQuery

    if (error) return { data: null, error }

    // Client-side filtering by query
    if (!query.trim()) {
      return { data: data || [], error: null }
    }

    const filtered = data?.filter((arrete: ArreteMunicipal) => {
      const searchString = `${arrete.titre} ${arrete.contenu || ''} ${arrete.categorie || ''}`.toLowerCase()
      return searchString.includes(query.toLowerCase())
    })

    return { data: filtered || [], error: null }
  }
}
