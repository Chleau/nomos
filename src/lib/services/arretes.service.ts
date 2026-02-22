import { supabase } from '../supabase/client'
import type { ArreteMunicipal } from '@/types/entities'

export const arretesService = {
  async getAll(communeId: number | null) {
    let query = supabase
      .from('arretes_municipaux')
      .select(`
        *,
        habitants!agent_id (
          id,
          nom,
          prenom
        ),
        communes (
          id,
          nom
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
        habitants!agent_id (
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
        habitants!agent_id (
          id,
          nom,
          prenom
        )
      `)
      .eq('statut', 'Publié')
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
  },

  async getImportHistory(communeId: number | null) {
    let query = supabase
      .from('arretes_municipaux')
      .select(`
        id,
        import_name,
        date_creation,
        habitants!agent_id (
          id,
          nom,
          prenom
        ),
        communes (
            id,
            nom
        )
      `)
      .not('import_name', 'is', null)
      .order('date_creation', { ascending: false })

    if (communeId) {
      query = query.eq('commune_id', communeId)
    }

    const { data, error } = await query

    if (error) return { data: null, error }

    // Group by import_name to create "Import Events"
    // Since import_name is unique per batch for a given time (user input), we can group by it.
    // We take the first occurrence's date and agent.
    const uniqueImports = new Map()

    data?.forEach((item) => {
      if (item.import_name && !uniqueImports.has(item.import_name)) {
        uniqueImports.set(item.import_name, {
          id: item.id, // ID of one of the files, serving as key
          titre: item.import_name,
          date_creation: item.date_creation,
          agent: item.habitants,
          commune: item.communes,
          count: 1
        })
      } else if (item.import_name) {
        // Optionally count files in this import
        const existing = uniqueImports.get(item.import_name)
        existing.count++
      }
    })

    return { data: Array.from(uniqueImports.values()), error: null }
  },

  async getByImportName(importName: string, communeId: number | null) {
    let query = supabase
      .from('arretes_municipaux')
      .select(`
        *,
        habitants!agent_id (
          id,
          nom,
          prenom
        ),
        communes (
          id,
          nom
        )
      `)
      .eq('import_name', importName)
      .order('date_creation', { ascending: false })

    if (communeId) {
      query = query.eq('commune_id', communeId)
    }

    const { data, error } = await query
    return { data, error }
  }
}


