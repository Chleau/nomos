import ListeHabitants from '@/components/ListeHabitants'
import SignalementForm from '@/components/signalements/SignalementForm'

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <ListeHabitants />
      <SignalementForm />
    </main>
  )
}