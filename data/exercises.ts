import { auth } from '@clerk/nextjs/server'
import { db } from '@/app/db'
import { exerciseCatalog, workoutExercises, workouts } from '@/app/db/schema'
import { and, asc, count, eq, inArray } from 'drizzle-orm'

export async function getExerciseCatalog() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  return db.select().from(exerciseCatalog).orderBy(asc(exerciseCatalog.name))
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))

  if (!workout) throw new Error('Workout not found')

  const [{ value: exerciseCount }] = await db
    .select({ value: count() })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))

  return db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, orderIndex: exerciseCount })
    .returning()
}

export async function removeWorkoutExercise(workoutExerciseId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const ownedWorkoutIds = db
    .select({ id: workouts.id })
    .from(workouts)
    .where(eq(workouts.userId, userId))

  return db
    .delete(workoutExercises)
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        inArray(workoutExercises.workoutId, ownedWorkoutIds),
      ),
    )
}
