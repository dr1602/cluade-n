import { notFound } from 'next/navigation'
import { getWorkoutById } from '@/data/workouts'
import { EditWorkoutForm } from './EditWorkoutForm'

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  const workout = await getWorkoutById(workoutId)

  if (!workout) notFound()

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-8">Edit workout</h1>
      <EditWorkoutForm workout={workout} />
    </div>
  )
}
