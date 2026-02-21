'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Habitant } from '@/types/habitants';
import { useSupabaseAuth } from '@/lib/supabase/useSupabaseAuth';
import { habitantsService } from '@/lib/services/habitants.service';

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
  const { user, loading: authLoading } = useSupabaseAuth();
  const [habitantData, setHabitantData] = useState<HabitantFull | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHabitantData = async () => {
    if (user) {
      try {
        const { data, error } = await habitantsService.getByAuthUserId(user.id);
        if (!error && data) {
          setHabitantData(data as HabitantFull);
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
    if (authLoading) return;

    if (user) {
      // Charger les données si l'utilisateur change ou si elles ne sont pas là
      fetchHabitantData();
    } else {
      // Nettoyer les données si déconnexion
      setHabitantData(null);
      setLoading(false);
    }
  }, [user, authLoading]);

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
