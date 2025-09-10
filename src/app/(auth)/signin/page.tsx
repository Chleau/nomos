import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Connexion à votre compte
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connectez-vous pour accéder à votre espace
        </p>
      </div>

      <div className="mt-8">
        <SignInForm />
      </div>
    </div>
  )
}
