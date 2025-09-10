import { useQuery } from '@tanstack/react-query'
import { communeService } from '../services/communes.service'

export function useCommunes() {
  const { 
    data: communes, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['communes'],
    queryFn: async () => {
      const { data, error } = await communeService.getAll()
      if (error) throw error
      return data
    }
  })

  return {
    communes,
    isLoading,
    error
  }
}
