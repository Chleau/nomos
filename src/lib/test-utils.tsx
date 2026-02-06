import { QueryClient } from '@tanstack/react-query'

/**
 * Crée un QueryClient pour les tests avec des options optimisées
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Désactive les retries pour des tests plus rapides
        retry: false,
        // Désactive le cache entre les tests
        cacheTime: 0,
        // Désactive le staleTime
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    // Supprime les logs d'erreur pendant les tests
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => { },
    },
  })
}

/**
 * Wrapper de test pour React Query
 */
export function createTestWrapper() {
  const queryClient = createTestQueryClient()

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  Wrapper.displayName = 'TestQueryWrapper'
  return Wrapper
}

// Import nécessaire pour le JSX
import { QueryClientProvider } from '@tanstack/react-query'
