import { notFound } from 'next/navigation'
import { getWorkoutById } from '@/data/workouts'
import { getExerciseCatalog } from '@/data/exercises'
import { getWorkoutExercisesWithSets } from '@/data/sets'
import { EditWorkoutForm } from './EditWorkoutForm'
import { ExerciseList } from './ExerciseList'
import { AddExerciseForm } from './AddExerciseForm'

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  const workout = await getWorkoutById(workoutId)

  if (!workout) notFound()

  const [workoutExercises, exerciseCatalog] = await Promise.all([
    getWorkoutExercisesWithSets(workoutId),
    getExerciseCatalog(),
  ])

  return (
    <div className="max-w-lg mx-auto py-10 px-4 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold mb-8">Edit workout</h1>
        <EditWorkoutForm workout={workout} />
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Exercises</h2>
        <ExerciseList workoutExercises={workoutExercises} />
        <AddExerciseForm workoutId={workoutId} exerciseCatalog={exerciseCatalog} />
      </div>
    </div>
  )
}
