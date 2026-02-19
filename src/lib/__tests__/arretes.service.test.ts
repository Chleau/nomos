import { arretesService } from '../services/arretes.service'
import { supabase } from '../supabase/client'

// Mock Supabase client
jest.mock('../supabase/client', () => ({
    supabase: {
        from: jest.fn(),
    },
}))

describe('arretesService - Archives & Imports', () => {
    let mockQuery: any

    beforeEach(() => {
        jest.clearAllMocks()

        // Create a chainable mock object that is also then-able (awaitable)
        mockQuery = {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            not: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
            // Default implementation of then - must utilize the callback to simulate promise resolution
            then: jest.fn((resolve) => resolve({ data: [], error: null }))
        }

            // Default 'from' implementation returns the chainable mock
            ; (supabase.from as jest.Mock).mockReturnValue(mockQuery)
    })

    describe('getImportHistory', () => {
        it('should fetch and group import history correctly', async () => {
            // Mock data returned from Supabase
            const mockData = [
                {
                    id: 1,
                    import_name: 'Import Janvier 2024',
                    date_creation: '2024-01-01',
                    habitants: { id: 1, nom: 'Doe', prenom: 'John' },
                    communes: { id: 100, nom: 'Paris' },
                },
                {
                    id: 2,
                    import_name: 'Import Janvier 2024',
                    date_creation: '2024-01-01',
                    habitants: { id: 1, nom: 'Doe', prenom: 'John' },
                    communes: { id: 100, nom: 'Paris' },
                },
                {
                    id: 3,
                    import_name: 'Import Février 2024',
                    date_creation: '2024-02-01',
                    habitants: { id: 2, nom: 'Smith', prenom: 'Jane' },
                    communes: { id: 100, nom: 'Paris' },
                },
            ]

            // Setup mock return via the 'then' method
            mockQuery.then.mockImplementation((resolve: any) => resolve({ data: mockData, error: null }))

            const result = await arretesService.getImportHistory(100)

            // Verify Supabase calls
            expect(supabase.from).toHaveBeenCalledWith('arretes_municipaux')
            expect(mockQuery.select).toHaveBeenCalledWith(expect.stringContaining('import_name'))
            expect(mockQuery.not).toHaveBeenCalledWith('import_name', 'is', null)
            expect(mockQuery.eq).toHaveBeenCalledWith('commune_id', 100)
            expect(mockQuery.order).toHaveBeenCalledWith('date_creation', { ascending: false })

            // Verify grouping logic
            expect(result.data).toHaveLength(2) // Should have 2 unique imports
            expect(result.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        titre: 'Import Janvier 2024',
                        count: 2,
                        agent: { id: 1, nom: 'Doe', prenom: 'John' },
                    }),
                    expect.objectContaining({
                        titre: 'Import Février 2024',
                        count: 1,
                        agent: { id: 2, nom: 'Smith', prenom: 'Jane' },
                    }),
                ])
            )
        })

        it('should handle errors from Supabase', async () => {
            const mockError = { message: 'Database error' }
            mockQuery.then.mockImplementation((resolve: any) => resolve({ data: null, error: mockError }))

            const result = await arretesService.getImportHistory(100)

            expect(result.error).toEqual(mockError)
            expect(result.data).toBeNull()
        })
    })

    describe('getByImportName', () => {
        it('should fetch documents for a specific import', async () => {
            const mockDocuments = [
                { id: 1, titre: 'Doc 1', import_name: 'Import A' },
                { id: 2, titre: 'Doc 2', import_name: 'Import A' },
            ]

            mockQuery.then.mockImplementation((resolve: any) => resolve({ data: mockDocuments, error: null }))

            const result = await arretesService.getByImportName('Import A', 100)

            expect(supabase.from).toHaveBeenCalledWith('arretes_municipaux')
            expect(mockQuery.eq).toHaveBeenCalledWith('import_name', 'Import A')
            expect(mockQuery.eq).toHaveBeenCalledWith('commune_id', 100)
            expect(result.data).toEqual(mockDocuments)
        })
    })
})
