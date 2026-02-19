import { supabase } from '../supabase/client'
import type { SuiviSignalement } from '@/types/entities'

export const suiviService = {
    async getBySignalement(signalementId: number) {
        const { data, error } = await supabase
            .from('suivi_signalements')
            .select('*')
            .eq('signalement_id', signalementId)
            .order('created_at', { ascending: true })

        return { data, error }
    },

    async create(suivi: Omit<SuiviSignalement, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('suivi_signalements')
            .insert(suivi)
            .select()
            .single()

        return { data, error }
    },

    async delete(id: number) {
        const { error } = await supabase
            .from('suivi_signalements')
            .delete()
            .eq('id', id)

        return { error }
    }
}
