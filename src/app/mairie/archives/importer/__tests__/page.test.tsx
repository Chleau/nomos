import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ImportArchivesPage from '../page'
import { createTestWrapper } from '@/lib/test-utils'
import { agentsService } from '@/lib/services/agents.service'
import { uploadArreteFile } from '@/lib/services/storage.service'
import '@testing-library/jest-dom'

// Mocks
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
  useCurrentHabitant: () => ({ data: { id: 1, commune_id: 100, prenom: 'Luc', nom: 'Maire' } })
}))

jest.mock('@/lib/hooks/useCommunes', () => ({
  useCommune: () => ({ data: { nom: 'VilleTest' } })
}))

// Mock Services
jest.mock('@/lib/services/agents.service', () => ({
  agentsService: { getOrCreateAgentFromHabitant: jest.fn() }
}))

jest.mock('@/lib/services/storage.service', () => ({
  uploadArreteFile: jest.fn(),
  getArreteFileUrl: jest.fn((path) => `https://fake.url/${path}`)
}))

// Mock Mutation
const mockCreateArreteMutate = jest.fn()
jest.mock('@/lib/hooks/useArretes', () => ({
  useCreateArrete: () => ({ mutateAsync: mockCreateArreteMutate })
}))

// Mock ArchiveFileCard to avoid complex rendering - keep it simple?
// Actually checking if card renders is good. 
// ArchiveFileCard likely renders the file name.

describe('ImportArchivesPage', () => {
  const Wrapper = createTestWrapper()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(agentsService.getOrCreateAgentFromHabitant as jest.Mock).mockResolvedValue({
      data: { id: 99 },
      error: null
    })
    ;(uploadArreteFile as jest.Mock).mockResolvedValue('path/to/file.pdf')
  })

  it('renders initial state', () => {
    render(<ImportArchivesPage />, { wrapper: Wrapper })
    expect(screen.getByText(/Importer des archives/i)).toBeInTheDocument()
    expect(screen.getByText(/Glisser-déposer ou/i)).toBeInTheDocument()
  })

  it('handles file selection', async () => {
    render(<ImportArchivesPage />, { wrapper: Wrapper })

    const file = new File(['dummy content'], 'test-file.pdf', { type: 'application/pdf' })
    // The input is hidden so we select it by selector
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    
    Object.defineProperty(fileInput, 'files', {
        value: [file]
    })
    fireEvent.change(fileInput)

    await waitFor(() => {
        // use queryAll because it might be in multiple places or input
        const elements = screen.queryAllByText('test-file').concat(screen.queryAllByDisplayValue('test-file'))
        expect(elements.length).toBeGreaterThan(0)
    })
  })

  it('submits import successfully', async () => {
     render(<ImportArchivesPage />, { wrapper: Wrapper })

     // 1. Add file
     const file = new File(['dummy content'], 'doc.pdf', { type: 'application/pdf' })
     const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
     Object.defineProperty(fileInput, 'files', { value: [file] })
     fireEvent.change(fileInput)
     
     // 2. Add import name
     await waitFor(() => expect(screen.getByPlaceholderText(/Arrêtés entre/)).toBeInTheDocument())
     const nameInput = screen.getByPlaceholderText(/Arrêtés entre/)
     fireEvent.change(nameInput, { target: { value: 'Import Mai 2023' } })

     // 3. Submit
     const submitBtn = screen.getByText("Valider l'importation")
     fireEvent.click(submitBtn)

     // 4. Verify calls
     await waitFor(() => {
         expect(uploadArreteFile).toHaveBeenCalled()
         expect(mockCreateArreteMutate).toHaveBeenCalledWith(expect.objectContaining({
             titre: 'doc',
             import_name: 'Import Mai 2023'
         }))
     })
     
     // 5. Success Modal
     await waitFor(() => {
         expect(screen.getByText(/Vos documents ont été correctement importés/i)).toBeInTheDocument()
     })
  })
})
