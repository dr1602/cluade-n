import { auth } from '@clerk/nextjs/server'
import { db } from '@/app/db'
import { sets, workoutExercises, workouts } from '@/app/db/schema'
import { and, asc, count, eq, inArray } from 'drizzle-orm'

export type SetInput = {
  reps: number | null
  weightKg: number | null
  durationSeconds: number | null
  restSeconds: number | null
  rpe: number | null
  notes: string | null
}

export async function getWorkoutExercisesWithSets(workoutId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))

  if (!workout) throw new Error('Workout not found')

  return db.query.workoutExercises.findMany({
    where: eq(workoutExercises.workoutId, workoutId),
    orderBy: asc(workoutExercises.orderIndex),
    with: {
      exercise: true,
      sets: { orderBy: asc(sets.setNumber) },
    },
  })
}

function ownedWorkoutExerciseIds(userId: string) {
  return db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(eq(workouts.userId, userId))
}

export async function createSet(workoutExerciseId: string, data: SetInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const [owned] = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(and(eq(workouts.userId, userId), eq(workoutExercises.id, workoutExerciseId)))
  if (!owned) throw new Error('Workout exercise not found')

  const [{ value: setCount }] = await db
    .select({ value: count() })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId))

  return db
    .insert(sets)
    .values({ workoutExerciseId, setNumber: setCount + 1, ...toNumericFields(data) })
    .returning()
}

export async function updateSet(setId: string, data: SetInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  return db
    .update(sets)
    .set(toNumericFields(data))
    .where(and(eq(sets.id, setId), inArray(sets.workoutExerciseId, ownedWorkoutExerciseIds(userId))))
    .returning()
}

export async function deleteSet(setId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  return db
    .delete(sets)
    .where(and(eq(sets.id, setId), inArray(sets.workoutExerciseId, ownedWorkoutExerciseIds(userId))))
}

function toNumericFields(data: SetInput) {
  return {
    reps: data.reps,
    weightKg: data.weightKg !== null ? data.weightKg.toFixed(2) : null,
    durationSeconds: data.durationSeconds,
    restSeconds: data.restSeconds,
    rpe: data.rpe !== null ? data.rpe.toFixed(1) : null,
    notes: data.notes,
  }
}
