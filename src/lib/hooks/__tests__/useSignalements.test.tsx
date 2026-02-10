import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSignalements, useAllSignalements } from '../useSignalements'
import { signalementsService } from '../../services/signalements.service'

// Mock du service
jest.mock('../../services/signalements.service')

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    })
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
    Wrapper.displayName = 'TestQueryWrapper'
    return Wrapper
}

describe('useSignalements', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createSignalement', () => {
        it('devrait créer un signalement avec succès', async () => {
            const mockSignalement = {
                titre: 'Test Title',
                description: 'Test Description',
                habitant_id: 1,
                type_id: 1,
                latitude: 48.8566,
                longitude: 2.3522,
                url: undefined,
                statut: 'en_attente',
            }

            const mockResponse = { data: { id: 1, ...mockSignalement }, error: null }
                ; (signalementsService.create as jest.Mock).mockResolvedValue(mockResponse)

            const { result } = renderHook(() => useSignalements(), {
                wrapper: createWrapper(),
            })

            result.current.createSignalement.mutate(mockSignalement)

            await waitFor(() => expect(result.current.createSignalement.isSuccess).toBe(true))

            expect(signalementsService.create).toHaveBeenCalledWith(mockSignalement)
        })

        it('devrait gérer les erreurs de création', async () => {
            const mockError = { data: null, error: { message: 'Database error' } }
                ; (signalementsService.create as jest.Mock).mockResolvedValue(mockError)

            const { result } = renderHook(() => useSignalements(), {
                wrapper: createWrapper(),
            })

            result.current.createSignalement.mutate({
                titre: 'Test Title',
                description: 'Test Description',
                habitant_id: 1,
                type_id: 1,
                latitude: 48.8566,
                longitude: 2.3522,
                url: undefined,
                statut: 'en_attente',
                agent_id: undefined,
            })

            await waitFor(() => expect(result.current.createSignalement.isIdle).toBe(false))

            expect(signalementsService.create).toHaveBeenCalled()
        })
    })

    describe('updateSignalementUrl', () => {
        it('devrait mettre à jour l\'URL d\'un signalement', async () => {
            const mockResponse = {
                data: { id: 1, url: 'https://example.com/photo.jpg' },
                error: null,
            }
                ; (signalementsService.updateUrl as jest.Mock).mockResolvedValue(mockResponse)

            const { result } = renderHook(() => useSignalements(), {
                wrapper: createWrapper(),
            })

            result.current.updateSignalementUrl.mutate({
                id: 1,
                url: 'https://example.com/photo.jpg',
            })

            await waitFor(() =>
                expect(result.current.updateSignalementUrl.isSuccess).toBe(true)
            )

            expect(signalementsService.updateUrl).toHaveBeenCalledWith(
                1,
                'https://example.com/photo.jpg'
            )
        })
    })
})

describe('useAllSignalements', () => {
    it('devrait récupérer tous les signalements', async () => {
        const mockSignalements = [
            {
                id: 1,
                titre: 'Signalement 1',
                photos_signalement: [],
                types_signalement: { id: 1, libelle: 'Type 1' },
                habitants: { id: 1, nom: 'Doe', prenom: 'John' },
            },
        ]

            ; (signalementsService.getAll as jest.Mock).mockResolvedValue({
                data: mockSignalements,
                error: null,
            })

        const { result } = renderHook(() => useAllSignalements(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(result.current.data).toEqual(mockSignalements)
        expect(signalementsService.getAll).toHaveBeenCalledWith(undefined)
    })

    it('devrait gérer les limites de résultats', async () => {
        ; (signalementsService.getAll as jest.Mock).mockResolvedValue({
            data: [],
            error: null,
        })

        const { result } = renderHook(() => useAllSignalements(5), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))

        expect(signalementsService.getAll).toHaveBeenCalledWith(5)
    })

    it('devrait gérer les erreurs', async () => {
        const mockError = new Error('Failed to fetch')
            ; (signalementsService.getAll as jest.Mock).mockResolvedValue({
                data: null,
                error: mockError,
            })

        const { result } = renderHook(() => useAllSignalements(), {
            wrapper: createWrapper(),
        })

        await waitFor(() => expect(result.current.isError).toBe(true))

        expect(result.current.error).toBeDefined()
    })
})
