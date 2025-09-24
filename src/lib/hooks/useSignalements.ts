import { useMutation, useQueryClient } from '@tanstack/react-query'
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

  const updateSignalementUrl = useMutation({
    mutationFn: ({ id, url }: { id: number; url: string }) =>
      signalementsService.updateUrl(id, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signalements'] })
    }
  });

  return {
    createSignalement,
    updateSignalementUrl
  }
}
