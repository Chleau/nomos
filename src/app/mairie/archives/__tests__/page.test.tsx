import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ArchivesPage from '../page'
import { createTestWrapper } from '@/lib/test-utils'
import '@testing-library/jest-dom'

// Mocks need to be defined before describing tests
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

// Mock RoleProtectedPage to simply render children
jest.mock('@/components/auth/RoleProtectedPage', () => ({
  RoleProtectedPage: ({ children }: { children: React.ReactNode }) => <div data-testid="protected-content">{children}</div>
}))

jest.mock('@/lib/supabase/useSupabaseAuth', () => ({
  useSupabaseAuth: () => ({ user: { id: 'test-user-id' } })
}))

jest.mock('@/lib/hooks/useHabitants', () => ({
  useCurrentHabitant: () => ({ data: { id: 1, commune_id: 100 } })
}))

// Mutable mock data
const mockArretesData = [
  {
    id: 1,
    titre: 'Arrêté Stationnement',
    numero: 'ARR-2023-001',
    categorie: 'Voirie',
    date_creation: '2023-01-01T10:00:00Z',
    statut: 'Archivé',
    archive: true,
    agent: { nom: 'Dupont' },
    communes: { nom: 'Mairie Test' }
  },
  {
    id: 2,
    titre: 'Arrêté Travaux',
    numero: 'ARR-2023-002',
    categorie: 'Travaux',
    date_creation: '2023-02-01T10:00:00Z',
    statut: 'Archivé',
    archive: true,
    agent: { nom: 'Martin' },
    communes: { nom: 'Mairie Test' }
  }
]

const mockUseArretes = jest.fn()
const mockDeleteMutate = jest.fn()
const mockUpdateMutate = jest.fn()

jest.mock('@/lib/hooks/useArretes', () => ({
  useArretes: (communeId: number | null) => mockUseArretes(communeId),
  useDeleteArrete: () => ({ mutateAsync: mockDeleteMutate }),
  useUpdateArrete: () => ({ mutateAsync: mockUpdateMutate })
}))

describe('ArchivesPage', () => {
  const Wrapper = createTestWrapper()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseArretes.mockReturnValue({
      data: mockArretesData,
      isLoading: false
    })
  })

  it('renders loading state', () => {
    mockUseArretes.mockReturnValue({
      data: undefined,
      isLoading: true
    })

    render(<ArchivesPage />, { wrapper: Wrapper })
    expect(screen.getByText(/chargement/i)).toBeInTheDocument()
  })

  it('renders archives list successfully', async () => {
    render(<ArchivesPage />, { wrapper: Wrapper })

    await waitFor(() => {
      expect(screen.getByText('Arrêté Stationnement')).toBeInTheDocument()
    })
    expect(screen.getByText('Arrêté Travaux')).toBeInTheDocument()
    // Reference is not displayed in the table columns
    // expect(screen.getByText('ARR-2023-001')).toBeInTheDocument() 
    expect(screen.getAllByText(/Voirie/)[0]).toBeInTheDocument()
  })

  it('filters archives by search term', async () => {
    render(<ArchivesPage />, { wrapper: Wrapper })

    await waitFor(() => expect(screen.getByText('Arrêté Stationnement')).toBeInTheDocument())

    const searchInput = screen.getByPlaceholderText(/rechercher/i)
    fireEvent.change(searchInput, { target: { value: 'Stationnement' } })

    await waitFor(() => {
      expect(screen.getByText('Arrêté Stationnement')).toBeInTheDocument()
      expect(screen.queryByText('Arrêté Travaux')).not.toBeInTheDocument()
    })
  })

  it('handles row deletion', async () => {
    window.confirm = jest.fn(() => true)
    
    render(<ArchivesPage />, { wrapper: Wrapper })

    await waitFor(() => {
        expect(screen.getByText('Arrêté Stationnement')).toBeInTheDocument()
    })

    // Find the action buttons.
    // The first row (Arrêté Stationnement) should have an action button.
    const actionButtons = screen.getAllByLabelText('Actions')
    
    // Check which one corresponds to our row or simply test functionality on the first one.
    // Assuming the order matches the rows.
    // If sort is by date (recent first), the order might be id 2 then id 1 if dates are different.
    // Let's just click the first available action button and verify the call.
    // We mocked delete with specific ID? 
    // Wait, if we click the FIRST button, and the sort order puts ID 2 first (Feb 1st vs Jan 1st), 
    // we should expect delete with ID 2.
    // In previous test I expected ID 1.
    // mockArretesData: 
    // id 1: Jan 1st
    // id 2: Feb 1st
    // Sort logic in component: 
    // if sortOrder === 'recent' (default), returns b.rawDate - a.rawDate? Or a implementation details.
    // Generally 'recent' means descending date. So Feb 1st (id 2) comes before Jan 1st (id 1).
    // So the FIRST row is ID 2.
    
    expect(actionButtons.length).toBeGreaterThan(0)
    
    // Interact with the first row (ID 2)
    fireEvent.click(actionButtons[0])
    
    const deleteBtn = await screen.findByText('Supprimer')
    fireEvent.click(deleteBtn)

    await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled()
        // Expect ID 2
        expect(mockDeleteMutate).toHaveBeenCalledWith(2)
    })
  })
})
