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
      <h1 className="font-['Poppins'] text-4xl font-semibold mb-10 text-[#242A35]">Se connecter</h1>

      {error && (
        <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-xl font-['Poppins'] font-medium text-[#242A35] mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full h-[50px] rounded-sm border border-gray-300 bg-white px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
            placeholder="exemple@gmail.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xl font-['Poppins'] font-medium text-[#242A35] mb-2">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full h-[50px] rounded-sm border border-gray-300 bg-white px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
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
          className="w-full bg-[#F27F09] text-white py-4 px-4 rounded-xl font-medium hover:bg-[#F59839] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Connexion en cours...' : 'Connexion'}
        </button>
      </form>
    </div>
  )
}