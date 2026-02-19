import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { suiviService } from '../services/suivi.service'
import type { SuiviSignalement } from '@/types/entities'

export function useSuiviSignalement(signalementId: number | null) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['suivi_signalement', signalementId],
        queryFn: async () => {
            if (!signalementId) return []
            const { data, error } = await suiviService.getBySignalement(signalementId)
            if (error) throw error
            return data as SuiviSignalement[]
        },
        enabled: !!signalementId
    })

    const addSuivi = useMutation({
        mutationFn: (newSuivi: Omit<SuiviSignalement, 'id' | 'created_at'>) =>
            suiviService.create(newSuivi),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suivi_signalement', signalementId] })
        }
    })

    return {
        ...query,
        addSuivi
    }
}
