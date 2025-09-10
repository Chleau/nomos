'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      console.log('Signup response:', { authData, error }) // Pour le débogage
      
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
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>
      
      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
            Nom
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
            Prénom
          </label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="commune_id" className="block text-sm font-medium text-gray-700">
            Commune
          </label>
          <select
            id="commune_id"
            name="commune_id"
            required
            disabled={communesLoading}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-gray-100"
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Inscription en cours...' : 'S\'inscrire'}
        </button>
      </form>
    </div>
  )
}
