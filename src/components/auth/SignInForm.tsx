'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/lib/services/auth.service'

export function SignInForm() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // Vérification basique du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Format d\'email invalide. Veuillez vérifier votre saisie.')
        setLoading(false)
        return
      }

      const { error } = await authService.signIn(email, password)
      if (error) {
        if (error.message?.includes('invalid')) {
          setError('Adresse email invalide. Veuillez vérifier votre saisie.')
        } else {
          setError('Email ou mot de passe incorrect')
        }
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Se connecter</h1>
      
      {error && (
        <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full rounded-xl border-0 bg-white px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 shadow-sm"
            placeholder="exemple@gmail.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full rounded-xl border-0 bg-white px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 shadow-sm"
            placeholder="Entrez votre mot de passe"
          />
          <div className="mt-2 text-right">
            <button type="button" className="text-xs text-gray-900 hover:underline">
              Mot de passe oublié
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 px-4 rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Connexion en cours...' : 'Connexion'}
        </button>
      </form>
    </div>
  )
}