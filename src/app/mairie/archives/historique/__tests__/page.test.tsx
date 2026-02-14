import { render, screen, waitFor } from '@testing-library/react'
import HistoriqueImportsPage from '../page'
import { createTestWrapper } from '@/lib/test-utils'
import { arretesService } from '@/lib/services/arretes.service'
import '@testing-library/jest-dom'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}))

jest.mock('@/components/auth/RoleProtectedPage', () => ({
  RoleProtectedPage: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

jest.mock('@/lib/supabase/useSupabaseAuth', () => ({
  useSupabaseAuth: () => ({ user: { id: 'test-user-id' } })
}))

jest.mock('@/lib/hooks/useHabitants', () => ({
  useCurrentHabitant: () => ({ data: { id: 1, commune_id: 100 } })
}))

// Mock service
jest.mock('@/lib/services/arretes.service', () => ({
  arretesService: {
    getImportHistory: jest.fn()
  }
}))

const mockImports = [
  {
    id: 1,
    titre: 'Import 2023',
    date_creation: '2023-01-01T10:00:00Z',
    agent: { nom: 'Dupont', prenom: 'Jean' },
    commune: { nom: 'Villetest' }
  },
  {
    id: 2,
    titre: 'Import 2024',
    date_creation: '2024-01-01T10:00:00Z',
    agent: null,
    commune: { nom: 'Villetest' }
  }
]

describe('HistoriqueImportsPage', () => {
  const Wrapper = createTestWrapper()
  
  beforeEach(() => {
     jest.clearAllMocks()
     ;(arretesService.getImportHistory as jest.Mock).mockResolvedValue({ 
         data: mockImports, 
         error: null 
     })
  })

  it('renders history list with agents', async () => {
    render(<HistoriqueImportsPage />, { wrapper: Wrapper })
    await waitFor(() => {
        expect(screen.getByText('Import 2023')).toBeInTheDocument()
    })
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    // ID 2 has no agent -> 'Inconnu'
    expect(screen.getByText('Import 2024')).toBeInTheDocument()
    expect(screen.getByText('Inconnu')).toBeInTheDocument()
  })

  it('renders empty state', async () => {
     ;(arretesService.getImportHistory as jest.Mock).mockResolvedValue({ 
         data: [], 
         error: null 
     })

     render(<HistoriqueImportsPage />, { wrapper: Wrapper })
     
     await waitFor(() => {
         expect(screen.getByText("Aucun historique d'import trouvé.")).toBeInTheDocument()
     })
  })
})
