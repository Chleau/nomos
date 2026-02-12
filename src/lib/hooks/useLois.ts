import { useQuery } from '@tanstack/react-query'
import { loisService } from '../services/lois.service'

export function useLois() {
  return useQuery({
    queryKey: ['lois'],
    queryFn: async () => {
      const { data, error } = await loisService.getAll()
      if (error) throw error
      return data
    }
  })
}

export function useLoiById(id: number) {
  return useQuery({
    queryKey: ['lois', id],
    queryFn: async () => {
      const { data, error } = await loisService.getById(id)
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useLoisByThematique(thematique: string) {
  return useQuery({
    queryKey: ['lois', 'thematique', thematique],
    queryFn: async () => {
      const { data, error } = await loisService.getByThematique(thematique)
      if (error) throw error
      return data
    },
    enabled: !!thematique
  })
}

export function useSearchLois(searchTerm: string) {
  return useQuery({
    queryKey: ['lois', 'search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) {
        const { data, error } = await loisService.getAll()
        if (error) throw error
        return data
      }
      const { data, error } = await loisService.search(searchTerm)
      if (error) throw error
      return data
    },
    enabled: true
  })
}
