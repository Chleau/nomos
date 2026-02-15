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
            ; (agentsService.getOrCreateAgentFromHabitant as jest.Mock).mockResolvedValue({
                data: { id: 99 },
                error: null
            })
            ; (uploadArreteFile as jest.Mock).mockResolvedValue('path/to/file.pdf')
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
            // File name should appear as h3 text
            expect(screen.getByText('test-file.pdf')).toBeInTheDocument()
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
        await waitFor(() => expect(screen.getByPlaceholderText(/Arrêtés/i)).toBeInTheDocument())
        const nameInput = screen.getByPlaceholderText(/Arrêtés/i)
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

    it('handles drag and drop', async () => {
        render(<ImportArchivesPage />, { wrapper: Wrapper })

        const dropzone = screen.getByText(/Glisser-déposer/i).closest('div')
        expect(dropzone).toBeInTheDocument()

        const file = new File(['content'], 'dropped.pdf', { type: 'application/pdf' })
        const dataTransfer = { files: [file] }

        fireEvent.dragOver(dropzone!, { dataTransfer })
        fireEvent.drop(dropzone!, { dataTransfer })

        await waitFor(() => {
            expect(screen.getByText('dropped.pdf')).toBeInTheDocument()
        })
    })

    it('handles drag leave', async () => {
        render(<ImportArchivesPage />, { wrapper: Wrapper })

        const dropzone = screen.getByText(/Glisser-déposer/i).closest('div')

        fireEvent.dragOver(dropzone!)
        fireEvent.dragLeave(dropzone!)

        // Should remove drag styling
        expect(dropzone).toBeInTheDocument()
    })

    it('updates file metadata', async () => {
        render(<ImportArchivesPage />, { wrapper: Wrapper })

        // Add file first
        const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        Object.defineProperty(fileInput, 'files', { value: [file] })
        fireEvent.change(fileInput)

        await waitFor(() => {
            expect(screen.getByText('test.pdf')).toBeInTheDocument()
        })

        // Find title input field
        const titleInputs = screen.getAllByPlaceholderText(/Titre de l'archive/i)
        const titleInput = titleInputs[0]
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } })

        expect(screen.getByDisplayValue('Updated Title')).toBeInTheDocument()
    })

    it('deletes a file from list', async () => {
        render(<ImportArchivesPage />, { wrapper: Wrapper })

        // Add file
        const file = new File(['content'], 'removeme.pdf', { type: 'application/pdf' })
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        Object.defineProperty(fileInput, 'files', { value: [file] })
        fireEvent.change(fileInput)

        await waitFor(() => {
            expect(screen.getByText('removeme.pdf')).toBeInTheDocument()
        })

        // Find and click delete button (text is "Supprimer")
        const deleteBtn = screen.getByRole('button', { name: /supprimer/i })
        fireEvent.click(deleteBtn)

        await waitFor(() => {
            expect(screen.queryByText('removeme.pdf')).not.toBeInTheDocument()
        })
    })

    it('previews a file', async () => {
        window.open = jest.fn()
        global.URL.createObjectURL = jest.fn(() => 'blob:mockurl')

        render(<ImportArchivesPage />, { wrapper: Wrapper })

        // Add file
        const file = new File(['content'], 'preview.pdf', { type: 'application/pdf' })
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        Object.defineProperty(fileInput, 'files', { value: [file] })
        fireEvent.change(fileInput)

        await waitFor(() => {
            expect(screen.getByText('preview.pdf')).toBeInTheDocument()
        })

        // Click preview button (text is "Afficher")
        const previewBtn = screen.getByRole('button', { name: /afficher/i })
        fireEvent.click(previewBtn)

        expect(window.open).toHaveBeenCalledWith('blob:mockurl', '_blank')
    })

    it('shows error when import name is missing', async () => {
        render(<ImportArchivesPage />, { wrapper: Wrapper })

        // Add file but no import name
        const file = new File(['content'], 'file.pdf', { type: 'application/pdf' })
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        Object.defineProperty(fileInput, 'files', { value: [file] })
        fireEvent.change(fileInput)

        await waitFor(() => expect(screen.getByText('file.pdf')).toBeInTheDocument())

        // Submit without import name
        const submitBtn = screen.getByText("Valider l'importation")
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/Veuillez saisir un nom/i)).toBeInTheDocument()
        })
    })

    it('hides submit button when no files added', async () => {
        render(<ImportArchivesPage />, { wrapper: Wrapper })

        // Verify submit button is not visible when no files are added
        expect(screen.queryByText("Valider l'importation")).not.toBeInTheDocument()
    })

    it('handles agent creation error', async () => {
        ; (agentsService.getOrCreateAgentFromHabitant as jest.Mock).mockResolvedValue({
            data: null,
            error: { message: 'Agent error' }
        })

        render(<ImportArchivesPage />, { wrapper: Wrapper })

        // Add file and name
        const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        Object.defineProperty(fileInput, 'files', { value: [file] })
        fireEvent.change(fileInput)

        await waitFor(() => expect(screen.getByPlaceholderText(/Arrêtés/i)).toBeInTheDocument())
        const nameInput = screen.getByPlaceholderText(/Arrêtés/i)
        fireEvent.change(nameInput, { target: { value: 'Import' } })

        const submitBtn = screen.getByText("Valider l'importation")
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/Impossible de récupérer le profil agent/i)).toBeInTheDocument()
        })
    })

    it('handles upload error', async () => {
        ; (uploadArreteFile as jest.Mock).mockRejectedValue(new Error('Upload failed'))

        render(<ImportArchivesPage />, { wrapper: Wrapper })

        const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        Object.defineProperty(fileInput, 'files', { value: [file] })
        fireEvent.change(fileInput)

        await waitFor(() => expect(screen.getByPlaceholderText(/Arrêtés/i)).toBeInTheDocument())
        const nameInput = screen.getByPlaceholderText(/Arrêtés/i)
        fireEvent.change(nameInput, { target: { value: 'Import' } })

        const submitBtn = screen.getByText("Valider l'importation")
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/Upload failed/i)).toBeInTheDocument()
        })
    })

    it('resets form after success', async () => {
        render(<ImportArchivesPage />, { wrapper: Wrapper })

        // Complete import
        const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        Object.defineProperty(fileInput, 'files', { value: [file] })
        fireEvent.change(fileInput)

        const nameInput = screen.getByPlaceholderText(/Arrêtés/i)
        fireEvent.change(nameInput, { target: { value: 'Import' } })

        const submitBtn = screen.getByText("Valider l'importation")
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/Vos documents ont été correctement importés/i)).toBeInTheDocument()
        })

        // Click reset button
        const resetBtn = screen.getByText(/Importer de nouveaux documents/i)
        fireEvent.click(resetBtn)

        // Form should be cleared
        await waitFor(() => {
            expect(screen.queryByText(/Vos documents ont été correctement importés/i)).not.toBeInTheDocument()
        })
    })

    it('navigates back to archives from success modal', async () => {
        const mockPush = jest.fn()
        jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
            push: mockPush,
            back: jest.fn()
        })

        render(<ImportArchivesPage />, { wrapper: Wrapper })

        // Complete import
        const file = new File(['content'], 'doc.pdf', { type: 'application/pdf' })
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        Object.defineProperty(fileInput, 'files', { value: [file] })
        fireEvent.change(fileInput)

        const nameInput = screen.getByPlaceholderText(/Arrêtés/i)
        fireEvent.change(nameInput, { target: { value: 'Import' } })

        const submitBtn = screen.getByText("Valider l'importation")
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByText(/Vos documents ont été correctement importés/i)).toBeInTheDocument()
        })

        // The modal's Retour button should trigger navigation
        // Look for all Retour buttons and click the first (modal is rendered first in DOM order)
        const backBtns = screen.getAllByRole('button', { name: /Retour/i })
        fireEvent.click(backBtns[0])

        expect(mockPush).toHaveBeenCalledWith('/mairie/archives')
    })
})
