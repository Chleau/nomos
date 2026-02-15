import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react'
import ImportDetailsPage from '../page'
import { createTestWrapper } from '@/lib/test-utils'
import '@testing-library/jest-dom'
import { arretesService } from '@/lib/services/arretes.service'

// --- Mocks ---
const mockPush = jest.fn()
const mockBack = jest.fn()
const mockUseParams = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush, back: mockBack }),
    useParams: () => mockUseParams()
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

jest.mock('@/lib/hooks/useCommunes', () => ({
    useCommune: () => ({ data: { nom: 'VilleTest' } })
}))

const mockDeleteMutate = jest.fn()
const mockUpdateMutate = jest.fn()

jest.mock('@/lib/hooks/useArretes', () => ({
    useDeleteArrete: () => ({ mutateAsync: mockDeleteMutate }),
    useUpdateArrete: () => ({ mutateAsync: mockUpdateMutate })
}))

jest.mock('@/lib/services/arretes.service', () => ({
    arretesService: {
        getByImportName: jest.fn()
    }
}))

// Mock window/navigator methods
const originalOpen = window.open
const originalAlert = window.alert
const originalConfirm = window.confirm

beforeAll(() => {
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn() },
        writable: true
    })
    Object.defineProperty(navigator, 'share', {
        value: undefined,
        writable: true
    })
    // Mock URL.createObjectURL for download test
    global.URL.createObjectURL = jest.fn(() => 'blob:url')
})

afterAll(() => {
    window.open = originalOpen
    window.alert = originalAlert
    window.confirm = originalConfirm
})

const MOCK_DOCS = [
    {
        id: 101,
        titre: 'Arrêté Voirie 2023',
        numero: 'D-1',
        categorie: 'Voirie',
        date_creation: '2023-01-01T10:00:00Z',
        statut: 'Archivé',
        favori: false,
        fichier_url: 'http://example.com/file.pdf'
    },
    {
        id: 102,
        titre: 'Arrêté Urbanisme 2022',
        numero: 'D-2',
        categorie: 'Urbanisme',
        date_creation: '2022-01-01T10:00:00Z',
        statut: 'Archivé',
        favori: true,
        contenu: 'Contenu texte brut'
    },
    {
        id: 103,
        titre: 'Arrêté Education',
        numero: 'D-3',
        categorie: 'Education',
        date_creation: '2023-06-01T10:00:00Z',
        statut: 'Archivé',
        favori: false
    }
]

describe('ImportDetailsPage', () => {
    let Wrapper: React.ComponentType<any>

    beforeEach(() => {
        Wrapper = createTestWrapper()
        jest.clearAllMocks()
        // Reset window mocks
        window.open = jest.fn(() => ({}) as Window) // Returns a window object so !w check passes
        window.alert = jest.fn()
        window.confirm = jest.fn(() => true)

        mockUseParams.mockReturnValue({ importName: 'Import%20Test' })

            ; (arretesService.getByImportName as jest.Mock).mockResolvedValue({
                data: [...MOCK_DOCS],
                error: null
            })
    })

    it('renders the page correctly', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => {
            expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument()
            expect(screen.getByText('Import Test')).toBeInTheDocument()
        })
    })

    it('handles search filtering', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        const searchInput = screen.getByPlaceholderText('Rechercher')
        fireEvent.change(searchInput, { target: { value: 'Urbanisme' } })

        await waitFor(() => {
            expect(screen.queryByText('Arrêté Voirie 2023')).not.toBeInTheDocument()
            expect(screen.getByText('Arrêté Urbanisme 2022')).toBeInTheDocument()
        })
    })

    it('handles category filtering', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        // Wait for data to load by checking for a document title
        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        // Click on "Urbanisme" or "Voirie" category chip
        // Use getByRole to target the button specifically
        const catButton = screen.getByRole('button', { name: 'Voirie' })
        fireEvent.click(catButton)

        await waitFor(() => {
            // Should see Voirie doc
            expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument()
            // Should NOT see Urbanisme doc
            expect(screen.queryByText('Arrêté Urbanisme 2022')).not.toBeInTheDocument()
        })

        // Remove filter
        fireEvent.click(catButton)
        await waitFor(() => {
            expect(screen.getByText('Arrêté Urbanisme 2022')).toBeInTheDocument()
        })
    })

    it('handles "Mes favoris" filtering', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        // Mark Urbanisme as favorite
        const urbanismeRow = screen.getByText('Arrêté Urbanisme 2022').closest('tr')!
        const starBtn = urbanismeRow.querySelectorAll('td')[1].querySelector('button')!
        fireEvent.click(starBtn)

        const favFilterBtn = screen.getByRole('button', { name: /Mes favoris/i })
        fireEvent.click(favFilterBtn)

        await waitFor(() => {
            // Doc 2 is favorite in mock data
            expect(screen.getByText('Arrêté Urbanisme 2022')).toBeInTheDocument()
            expect(screen.queryByText('Arrêté Voirie 2023')).not.toBeInTheDocument()
        })
    })

    it('handles sorting', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        // Default sort is 'recent' (descending date)
        // Voirie (2023) should be before Urbanisme (2022)
        const rowsBefore = screen.getAllByRole('row').slice(1) // skip header
        expect(rowsBefore[0]).toHaveTextContent('Arrêté Education') // June 2023
        expect(rowsBefore[1]).toHaveTextContent('Arrêté Voirie 2023') // Jan 2023
        expect(rowsBefore[2]).toHaveTextContent('Arrêté Urbanisme 2022') // Jan 2022

        const sortBtn = screen.getByText(/Trier par : le plus récent/i)
        fireEvent.click(sortBtn)

        await waitFor(() => {
            expect(screen.getByText(/Trier par : le plus ancien/i)).toBeInTheDocument()
        })

        const rowsAfter = screen.getAllByRole('row').slice(1)
        expect(rowsAfter[0]).toHaveTextContent('Arrêté Urbanisme 2022')
        expect(rowsAfter[2]).toHaveTextContent('Arrêté Education')
    })

    it('toggles favorites', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        const nonFavRow = screen.getByText('Arrêté Voirie 2023').closest('tr')!

        // Find the favorite button (button in 2nd column)
        const favCell = nonFavRow.querySelectorAll('td')[1]
        const btn = favCell.querySelector('button')!

        fireEvent.click(btn)

        // Check filtering now
        const favFilterBtn = screen.getByRole('button', { name: /Mes favoris/i })
        fireEvent.click(favFilterBtn)

        await waitFor(() => {
            expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument()
        })
    })

    it('handles selection (single and all)', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        // Select All via header checkbox
        const headerCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(headerCheckbox)

        const totalDocs = MOCK_DOCS.length
        expect(screen.getByText(`Action groupées (${totalDocs})`)).toBeInTheDocument()

        // Unselect All
        fireEvent.click(headerCheckbox)
        expect(screen.queryByText(/Action groupées \(/)).not.toBeInTheDocument()

        // Select Single
        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1]) // First row
        expect(screen.getByText(`Action groupées (1)`)).toBeInTheDocument()
    })

    it('handles group action: View', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1])

        fireEvent.click(screen.getByText(/Action groupées/i))
        fireEvent.click(screen.getByText('Consulter'))

        expect(window.open).toHaveBeenCalledWith(expect.stringContaining('/mairie/archives/103?mode=view'), '_blank')
    })

    it('handles group action: Edit', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getAllByRole('checkbox')))

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1])

        fireEvent.click(screen.getByText(/Action groupées/i))
        fireEvent.click(screen.getByText('Modifier'))

        expect(window.open).toHaveBeenCalledWith(expect.stringContaining('mode=edit'), '_blank')
    })

    it('handles group action: Archive', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getAllByRole('checkbox')))

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1])

        fireEvent.click(screen.getByText(/Action groupées/i))
        fireEvent.click(screen.getByText('Archiver'))

        await waitFor(() => {
            expect(mockUpdateMutate).toHaveBeenCalledWith(expect.objectContaining({
                updates: expect.objectContaining({ archive: true })
            }))
        })
    })

    it('handles group action: Delete', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getAllByRole('checkbox')))

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1])

        fireEvent.click(screen.getByText(/Action groupées/i))
        fireEvent.click(screen.getByText('Supprimer'))

        await waitFor(() => {
            expect(mockDeleteMutate).toHaveBeenCalled()
        })
    })

    it('handles group action: Download (content blob)', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getByText('Arrêté Urbanisme 2022')).toBeInTheDocument())

        // Doc 102 (Urbanisme) has `contenu` but no URL.

        // Isolate Doc 102 by search
        const searchInput = screen.getByPlaceholderText('Rechercher')
        fireEvent.change(searchInput, { target: { value: 'Urbanisme' } })

        await waitFor(() => {
            expect(screen.queryByText('Arrêté Voirie 2023')).not.toBeInTheDocument()
            expect(screen.getByText('Arrêté Urbanisme 2022')).toBeInTheDocument()
        })

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1]) // Select visible row

        fireEvent.click(screen.getByText(/Action groupées/i))

        const linkSpy = jest.spyOn(HTMLElement.prototype, 'click')
        fireEvent.click(screen.getByText('Télécharger'))

        expect(linkSpy).toHaveBeenCalled()
        expect(global.URL.createObjectURL).toHaveBeenCalled()

        linkSpy.mockRestore()
    })

    it('handles group action: Download', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getAllByRole('checkbox')))

        const searchInput = screen.getByPlaceholderText('Rechercher')
        fireEvent.change(searchInput, { target: { value: 'Voirie' } })

        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1])

        fireEvent.click(screen.getByText(/Action groupées/i))

        const linkSpy = jest.spyOn(HTMLElement.prototype, 'click')
        fireEvent.click(screen.getByText('Télécharger'))

        expect(linkSpy).toHaveBeenCalled()
        linkSpy.mockRestore()
    })

    it('handles group action: Share (Clipboard fallback)', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getAllByRole('checkbox')))

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1])

        fireEvent.click(screen.getByText(/Action groupées/i))

        await act(async () => {
            fireEvent.click(screen.getByText('Partager'))
        })

        expect(navigator.clipboard.writeText).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('liens copiés'))
    })

    it('handles group action: Share (native)', async () => {
        // Mock share support
        const mockShare = jest.fn().mockResolvedValue(undefined)
        Object.defineProperty(navigator, 'share', { value: mockShare, writable: true })

        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getAllByRole('checkbox')))

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1]) // Select one

        fireEvent.click(screen.getByText(/Action groupées/i))
        fireEvent.click(screen.getByText('Partager'))

        expect(mockShare).toHaveBeenCalled()
    })

    it('handles popup blocked alert', async () => {
        ; (window.open as jest.Mock).mockReturnValue(null)

        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getAllByRole('checkbox')))

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1])

        fireEvent.click(screen.getByText(/Action groupées/i))
        fireEvent.click(screen.getByText('Consulter'))

        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('onglet(s) bloqué(s)'))
    })

    it('handles row actions via icons', async () => {
        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        const row = screen.getByText('Arrêté Voirie 2023').closest('tr')!
        const editBtn = within(row).getByTitle('Modifier')
        fireEvent.click(editBtn)

        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/mairie/archives/101?mode=edit'))
    })

    it('handles filter dropdown (date range)', async () => {
        const { container } = render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument())

        // Open Filter Dropdown
        const filterBtn = screen.getByRole('button', { name: /Filtres/i })
        fireEvent.click(filterBtn)

        // Find hidden date inputs
        const dateInputs = container.querySelectorAll('input[type="date"]')
        const startDateInput = dateInputs[0]
        const endDateInput = dateInputs[1]

        // Set range to cover 2023 (Doc 1 & 3) but exclude 2022 (Doc 2)
        fireEvent.change(startDateInput, { target: { value: '2023-01-01' } })
        fireEvent.change(endDateInput, { target: { value: '2023-12-31' } })

        const applyBtn = screen.getByRole('button', { name: /Appliquer les filtres/i })
        fireEvent.click(applyBtn)

        await waitFor(() => {
            expect(screen.getByText('Arrêté Voirie 2023')).toBeInTheDocument()
            expect(screen.getByText('Arrêté Education')).toBeInTheDocument()
            expect(screen.queryByText('Arrêté Urbanisme 2022')).not.toBeInTheDocument()
        })

        // Clear filters
        fireEvent.click(filterBtn) // Re-open

        const clearBtn = screen.getByRole('button', { name: /Supprimer les filtres/i })
        fireEvent.click(clearBtn)

        await waitFor(() => {
            expect(screen.getByText('Arrêté Urbanisme 2022')).toBeInTheDocument()
        })
    })

    it('handles data fetch error', async () => {
        // Reset and force error
        (arretesService.getByImportName as jest.Mock).mockReset();
        (arretesService.getByImportName as jest.Mock).mockResolvedValueOnce({
            data: null,
            error: new Error('Fetch failed')
        })

        render(<ImportDetailsPage />, { wrapper: Wrapper })
        await waitFor(() => {
            expect(screen.queryByText('Arrêté Voirie 2023')).not.toBeInTheDocument()
        })
    })
})
