import { signalementsService } from '../signalements.service'
import { supabase } from '../../supabase/client'

// Mock du client Supabase
jest.mock('../../supabase/client', () => ({
    supabase: {
        from: jest.fn(),
    },
}))

describe('signalementsService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('create', () => {
        it('devrait créer un nouveau signalement', async () => {
            const mockSignalement = {
                titre: 'Test Title',
                description: 'Test Description',
                habitant_id: 1,
                type_id: 1,
                latitude: 48.8566,
                longitude: 2.3522,
                url: undefined,
                statut: 'en_attente',
                agent_id: undefined,
            }

            const mockResponse = {
                id: 1,
                ...mockSignalement,
                created_at: '2026-02-06T00:00:00Z',
                date_signalement: '2026-02-06T00:00:00Z',
                date_dernier_suivi: null,
                date_validation: null,
            }

            const mockSelect = jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                    data: mockResponse,
                    error: null,
                }),
            })

            const mockInsert = jest.fn().mockReturnValue({
                select: mockSelect,
            })

            const mockFrom = jest.fn().mockReturnValue({
                insert: mockInsert,
            })

                ; (supabase.from as jest.Mock) = mockFrom

            const result = await signalementsService.create(mockSignalement)

            expect(mockFrom).toHaveBeenCalledWith('signalements')
            expect(mockInsert).toHaveBeenCalledWith(mockSignalement)
            expect(result.data).toEqual(mockResponse)
            expect(result.error).toBeNull()
        })

        it('devrait gérer les erreurs lors de la création', async () => {
            const mockError = { message: 'Database error' }

            const mockSelect = jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                    data: null,
                    error: mockError,
                }),
            })

            const mockInsert = jest.fn().mockReturnValue({
                select: mockSelect,
            })

            const mockFrom = jest.fn().mockReturnValue({
                insert: mockInsert,
            })

                ; (supabase.from as jest.Mock) = mockFrom

            const result = await signalementsService.create({
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

            expect(result.data).toBeNull()
            expect(result.error).toEqual(mockError)
        })
    })

    describe('updateUrl', () => {
        it('devrait mettre à jour l\'URL d\'un signalement', async () => {
            const signalementId = 1
            const newUrl = 'https://example.com/photo.jpg'

            const mockResponse = {
                id: signalementId,
                url: newUrl,
            }

            const mockSelect = jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                    data: mockResponse,
                    error: null,
                }),
            })

            const mockEq = jest.fn().mockReturnValue({
                select: mockSelect,
            })

            const mockUpdate = jest.fn().mockReturnValue({
                eq: mockEq,
            })

            const mockFrom = jest.fn().mockReturnValue({
                update: mockUpdate,
            })

                ; (supabase.from as jest.Mock) = mockFrom

            const result = await signalementsService.updateUrl(signalementId, newUrl)

            expect(mockFrom).toHaveBeenCalledWith('signalements')
            expect(mockUpdate).toHaveBeenCalledWith({ url: newUrl })
            expect(mockEq).toHaveBeenCalledWith('id', signalementId)
            expect(result.data).toEqual(mockResponse)
            expect(result.error).toBeNull()
        })
    })

    describe('getAll', () => {
        it('devrait récupérer tous les signalements', async () => {
            const mockSignalements = [
                {
                    id: 1,
                    titre: 'Signalement 1',
                    photos_signalement: [],
                    types_signalement: { id: 1, libelle: 'Type 1' },
                    habitants: { id: 1, nom: 'Doe', prenom: 'John' },
                },
                {
                    id: 2,
                    titre: 'Signalement 2',
                    photos_signalement: [],
                    types_signalement: { id: 2, libelle: 'Type 2' },
                    habitants: { id: 2, nom: 'Smith', prenom: 'Jane' },
                },
            ]

            const mockOrder = jest.fn().mockResolvedValue({
                data: mockSignalements,
                error: null,
            })

            const mockSelect = jest.fn().mockReturnValue({
                order: mockOrder,
            })

            const mockFrom = jest.fn().mockReturnValue({
                select: mockSelect,
            })

                ; (supabase.from as jest.Mock) = mockFrom

            const result = await signalementsService.getAll()

            expect(mockFrom).toHaveBeenCalledWith('signalements')
            expect(mockOrder).toHaveBeenCalledWith('date_signalement', { ascending: false })
            expect(result.data).toEqual(mockSignalements)
            expect(result.error).toBeNull()
        })

        it('devrait limiter le nombre de résultats', async () => {
            const limit = 5

            const mockOrderReturn = {
                limit: jest.fn().mockResolvedValue({
                    data: [],
                    error: null,
                }),
            }

            const mockOrder = jest.fn().mockReturnValue(mockOrderReturn)

            const mockSelect = jest.fn().mockReturnValue({
                order: mockOrder,
            })

            const mockFrom = jest.fn().mockReturnValue({
                select: mockSelect,
            })

                ; (supabase.from as jest.Mock) = mockFrom

            await signalementsService.getAll(limit)

            expect(mockOrderReturn.limit).toHaveBeenCalledWith(limit)
        })
    })
})
