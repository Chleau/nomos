'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/lib/services/auth.service'
import { useCommunes } from '@/lib/hooks/useCommunes'

export function SignUpForm() {
  const router = useRouter()
  const { communes, isLoading: communesLoading } = useCommunes()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = (formData.get('email') as string).trim()
    const password = formData.get('password') as string
    const nom = (formData.get('nom') as string).trim()
    const prenom = (formData.get('prenom') as string).trim()
    const communeId = formData.get('commune_id') as string

    // Validation basique
    if (!email || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      setLoading(false)
      return
    }

    if (!password || password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères')
      setLoading(false)
      return
    }

    if (!nom || !prenom) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    if (!communeId) {
      setError('Veuillez sélectionner une commune')
      setLoading(false)
      return
    }

    const data = {
      email,
      password,
      nom,
      prenom,
      commune_id: parseInt(communeId)
    }

    try {
      const { data: authData, error } = await authService.signUp(data)
      
      if (error) {
        console.error('Signup error:', error) // Pour le débogage
        setError(error.message)
      } else {
        // Redirection directe vers la page d'accueil
        router.push('/')
      }
    } catch (err) {
      console.error('Signup error details:', err) // Pour le débogage
      setError('Une erreur est survenue lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Créer un compte</h1>
      
      {error && (
        <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-600 mb-2">
              Nom
            </label>
            <input
              type="text"
              id="nom"
              name="nom"
              required
              className="w-full rounded-xl border-0 bg-white px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 shadow-sm"
              placeholder="Dupont"
            />
          </div>

          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-600 mb-2">
              Prénom
            </label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              required
              className="w-full rounded-xl border-0 bg-white px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 shadow-sm"
              placeholder="Jean"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
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
            minLength={8}
            className="w-full rounded-xl border-0 bg-white px-4 py-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 shadow-sm"
            placeholder="Minimum 8 caractères"
          />
        </div>

        <div>
          <label htmlFor="commune_id" className="block text-sm font-medium text-gray-600 mb-2">
            Commune
          </label>
          <select
            id="commune_id"
            name="commune_id"
            required
            disabled={communesLoading}
            className="w-full rounded-xl border-0 bg-white px-4 py-4 text-gray-900 focus:outline-none focus:ring-0 shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Sélectionnez votre commune</option>
            {communes?.map(commune => (
              <option key={commune.id} value={commune.id}>
                {commune.nom} ({commune.code_postal})
              </option>
            ))}
          </select>
          {communesLoading && (
            <p className="mt-1 text-sm text-gray-500">
              Chargement des communes...
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-4 px-4 rounded-xl font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all mt-6"
        >
          {loading ? 'Inscription en cours...' : 'Créer mon compte'}
        </button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link href="/signin" className="text-gray-900 hover:underline font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
