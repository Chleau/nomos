'use client'

import { SignInForm } from '@/components/auth/SignInForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { useState } from 'react'

export default function SignInPage() {
  return (
    <AuthPage />
  )
}


function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Partie gauche - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-[#053F5C] to-[#0a2f47] items-center justify-center rounded-r-3xl">
        <div className="text-center text-white px-12">
          <h2 className="text-5xl font-bold mb-6">Bienvenue</h2>
          <p className="text-lg text-gray-200 mb-8">
            {isSignUp 
              ? 'Rejoignez notre communauté de citoyens engagés' 
              : 'Accédez à votre compte pour signaler et consulter les incidents'}
          </p>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 px-6 py-12">
        <div className="w-full max-w-md">
          {isSignUp ? <SignUpForm /> : <SignInForm />}
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp 
                ? 'Vous avez déjà un compte? '
                : 'Pas encore de compte? '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#f27f09] font-semibold hover:underline"
              >
                {isSignUp ? 'Se connecter' : 'S\'inscrire'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
