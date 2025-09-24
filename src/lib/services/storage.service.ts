import { supabase } from '../supabase/client';

export async function uploadSignalementPhoto(file: File, signalementId: number) {
  const fileExt = file.name.split('.').pop();
  const filePath = `signalements/${signalementId}_${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('signalements')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  if (error) throw error;
  return data.path;
}

export function getPublicUrlFromPath(path: string) {
  const { publicUrl } = supabase.storage.from('signalements').getPublicUrl(path);
  return publicUrl;
}
