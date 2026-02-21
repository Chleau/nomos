'use client'

import { useState } from 'react'
import { authService } from '@/lib/services/auth.service'

export function useUpdatePassword() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const updatePassword = async (newPassword: string) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: updateError } = await authService.updatePassword(newPassword)

      if (updateError) {
        setError(updateError.message || 'Erreur lors de la mise à jour du mot de passe')
        return false
      }

      setSuccess(true)
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur unexpected est survenue'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    updatePassword,
    loading,
    error,
    success
  }
}
