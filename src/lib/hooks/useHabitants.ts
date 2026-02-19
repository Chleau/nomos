import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { habitantsService } from '../services/habitants.service'
import type { Habitant } from '@/types/habitants'

export function useHabitants() {
  const queryClient = useQueryClient()

  const { data: habitants, isLoading, error } = useQuery({
    queryKey: ['habitants'],
    queryFn: async () => {
      const { data, error } = await habitantsService.getAll()
      if (error) throw error
      return data
    }
  })

  const createHabitant = useMutation({
    mutationFn: (newHabitant: Omit<Habitant, 'id'>) =>
      habitantsService.create(newHabitant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitants'] })
    }
  })

  const updateHabitant = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Habitant> }) =>
      habitantsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitants'] })
    }
  })

  const deleteHabitant = useMutation({
    mutationFn: (id: number) => habitantsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitants'] })
    }
  })

  return {
    habitants,
    isLoading,
    error,
    createHabitant,
    updateHabitant,
    deleteHabitant
  }
}

export function useCurrentHabitant(authUserId: string | null) {
  return useQuery({
    queryKey: ['habitant', 'current', authUserId],
    queryFn: async () => {
      if (!authUserId) return null
      const { data, error } = await habitantsService.getByAuthUserId(authUserId)
      if (error) throw error
      return data
    },
    enabled: !!authUserId
  })
}

export function useHabitantSignalementsCount(habitantId: number | null) {
  return useQuery({
    queryKey: ['habitant', 'signalements-count', habitantId],
    queryFn: async () => {
      if (!habitantId) return 0
      const { data, error } = await habitantsService.getSignalementsCount(habitantId)
      if (error) throw error
      return data
    },
    enabled: !!habitantId
  })
}

export function useHabitantsByCommuneAndRoles(communeId: number | null, roles: string[]) {
  return useQuery({
    queryKey: ['habitants', 'commune', communeId, 'roles', roles],
    queryFn: async () => {
      if (!communeId) return []
      const { data, error } = await habitantsService.getByCommuneAndRoles(communeId, roles)
      if (error) throw error
      return data || []
    },
    enabled: !!communeId
  })
}
