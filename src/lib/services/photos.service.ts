import { supabase } from '../supabase/client';
import { PhotoSignalement } from '@/types/entities';

export async function createPhotoSignalement(signalementId: number, url: string) {
  const { data, error } = await supabase
    .from('photos_signalement')
    .insert({ signalement_id: signalementId, url })
    .select()
    .single();
  return { data, error };
}
