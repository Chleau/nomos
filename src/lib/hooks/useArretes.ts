import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { arretesService } from '../services/arretes.service'
import type { ArreteMunicipal } from '@/types/entities'

export function useArretes(communeId: number | null) {
  return useQuery({
    queryKey: ['arretes', communeId],
    queryFn: async () => {
      const { data, error } = await arretesService.getAll(communeId)
      if (error) throw error
      return data
    },
    enabled: !!communeId
  })
}

export function useRecentArretes(communeId: number | null, limit: number = 5) {
  return useQuery({
    queryKey: ['arretes', 'recent', communeId, limit],
    queryFn: async () => {
      const { data, error } = await arretesService.getRecent(communeId, limit)
      if (error) throw error
      return data
    },
    enabled: !!communeId
  })
}

export function useCreateArrete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (arrete: Partial<ArreteMunicipal>) => {
      const { data, error } = await arretesService.create(arrete)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arretes'] })
    }
  })
}


export function useUpdateArrete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string | number, updates: Partial<ArreteMunicipal> }) => {
      const { data, error } = await arretesService.update(id, updates)
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['arretes'] })
      queryClient.invalidateQueries({ queryKey: ['arrete', variables.id] })
    }
  })
}

export function useDeleteArrete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string | number) => {
      const { error } = await arretesService.delete(id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arretes'] })
    }
  })
}

export function useArrete(id: string | number | null) {
  return useQuery({
    queryKey: ['arrete', id],
    queryFn: async () => {
      const { data, error } = await arretesService.getById(id!)
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useSearchArretes(query: string, communeId?: number | null) {
  return useQuery({
    queryKey: ['arretes', 'search', query, communeId],
    queryFn: async () => {
      const { data, error } = await arretesService.search(query, communeId)
      if (error) throw error
      return data
    }
  })
}

