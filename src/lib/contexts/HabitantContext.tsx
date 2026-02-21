'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Habitant } from '@/types/habitants';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';

interface HabitantFull extends Habitant {
  adresse?: string;
  date_naissance?: string;
  communes?: { nom: string };
}

interface HabitantContextType {
  habitantData: HabitantFull | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const HabitantContext = createContext<HabitantContextType | undefined>(undefined);

export function HabitantProvider({ children }: { children: ReactNode }) {
  const { user } = useSupabaseAuth();
  const [habitantData, setHabitantData] = useState<HabitantFull | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHabitantData = async () => {
    if (user) {
      try {
        const response = await fetch(`/api/habitants?auth_user_id=${user.id}`);
        const { data, error } = await response.json();
        if (!error && data && data.length > 0) {
          setHabitantData(data[0]);
        }
      } catch (error) {
        console.error('Error loading habitant data:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Charger les données seulement si elles ne sont pas déjà chargées
    if (!habitantData && user) {
      fetchHabitantData();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, habitantData]);

  const refetch = async () => {
    setLoading(true);
    await fetchHabitantData();
  };

  return (
    <HabitantContext.Provider value={{ habitantData, loading, refetch }}>
      {children}
    </HabitantContext.Provider>
  );
}

export function useHabitant() {
  const context = useContext(HabitantContext);
  if (context === undefined) {
    throw new Error('useHabitant must be used within a HabitantProvider');
  }
  return context;
}
