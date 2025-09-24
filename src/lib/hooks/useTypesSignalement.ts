import { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { TypeSignalement } from '@/types/entities';

export function useTypesSignalement() {
  const [types, setTypes] = useState<TypeSignalement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTypes() {
      setLoading(true);
      const { data, error } = await supabase.from('types_signalement').select('*');
      if (error) {
        setError(error.message);
      } else {
        setTypes(data || []);
      }
      setLoading(false);
    }
    fetchTypes();
  }, []);

  return { types, loading, error };
}
