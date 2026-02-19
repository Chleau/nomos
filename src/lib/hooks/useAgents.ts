import { useQuery } from '@tanstack/react-query'
import { agentsService } from '../services/agents.service'

export function useAgentsByCommune(communeId: number | null) {
    return useQuery({
        queryKey: ['agents', 'commune', communeId],
        queryFn: async () => {
            if (!communeId) return []
            const { data, error } = await agentsService.getByCommune(communeId)
            if (error) throw error
            return data || []
        },
        enabled: !!communeId
    })
}

export function useCurrentAgent(email: string | null) {
    return useQuery({
        queryKey: ['agent', 'current', email],
        queryFn: async () => {
            if (!email) return null
            const { data, error } = await agentsService.getByEmail(email)
            if (error) throw error
            return data
        },
        enabled: !!email
    })
}
