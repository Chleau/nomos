import { SignUpForm } from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-screen flex">
      {/* Partie gauche - Image/Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-700 items-center justify-center rounded-r-3xl">
        <div className="text-center text-white px-12">
          {/* Vous pouvez ajouter un logo ou une illustration ici */}
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="w-full lg:w-1/2 bg-gray-100 px-[100px] py-12 flex flex-col justify-center">
        <SignUpForm />
      </div>
    </div>
  )
}
