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
    mutationFn: (arrete: Partial<ArreteMunicipal>) => arretesService.create(arrete),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arretes'] })
    }
  })
}

export function useUpdateArrete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string | number, updates: Partial<ArreteMunicipal> }) => 
      arretesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arretes'] })
    }
  })
}

export function useDeleteArrete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string | number) => arretesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arretes'] })
    }
  })
}

