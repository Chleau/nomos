import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { signalementsService } from '../services/signalements.service'
import type { Signalement } from '@/types/signalements'

export function useSignalements() {
  const queryClient = useQueryClient()

  const createSignalement = useMutation({
    mutationFn: (newSignalement: Omit<Signalement, 'id' | 'created_at' | 'date_signalement' | 'date_dernier_suivi' | 'date_validation'>) =>
      signalementsService.create(newSignalement),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signalements'] })
    }
  })

  const updateSignalement = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Signalement> }) =>
      signalementsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signalements'] })
    }
  })

  const updateSignalementUrl = useMutation({
    mutationFn: ({ id, url }: { id: number; url: string }) =>
      signalementsService.updateUrl(id, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signalements'] })
    }
  });

  return {
    createSignalement,
    updateSignalement,
    updateSignalementUrl
  }
}

export function useAllSignalements(limit?: number) {
  return useQuery({
    queryKey: ['signalements', 'all', limit],
    queryFn: async () => {
      const { data, error } = await signalementsService.getAll(limit)
      if (error) throw error
      return data
    }
  })
}

export function useHabitantSignalements(habitantId: number | null, limit?: number) {
  return useQuery({
    queryKey: ['signalements', 'habitant', habitantId, limit],
    queryFn: async () => {
      if (!habitantId) return []
      const { data, error } = await signalementsService.getByHabitant(habitantId, limit)
      if (error) throw error
      return data
    },
    enabled: !!habitantId
  })
}

export function useCommuneSignalementsCount(communeId: number | null) {
  return useQuery({
    queryKey: ['signalements', 'commune-count', communeId],
    queryFn: async () => {
      if (!communeId) return 0
      const { data, error } = await signalementsService.getCountByCommune(communeId)
      if (error) throw error
      return data
    },
    enabled: !!communeId
  })
}

export function useSignalement(id: number) {
  return useQuery({
    queryKey: ['signalements', id],
    queryFn: async () => {
      const { data, error } = await signalementsService.getById(id)
      if (error) throw error
      return data
    }
  })
}
