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
  const { data } = supabase.storage.from('signalements').getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadArreteFile(file: File, communeId: number) {
  const fileExt = file.name.split('.').pop();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `arretes/${communeId}/${Date.now()}_${sanitizedName}`;
  const { data, error } = await supabase.storage
    .from('arretes')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  if (error) throw error;
  return data.path;
}

export function getArreteFileUrl(path: string) {
  const { data } = supabase.storage.from('arretes').getPublicUrl(path);
  return data.publicUrl;
}
