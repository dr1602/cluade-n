import { auth } from '@clerk/nextjs/server'
import { db } from '@/app/db'
import { workouts } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'

export async function getWorkoutsForDate(date: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, userId), eq(workouts.date, date)))
}

export async function createWorkout(name: string | null, date: string, notes: string | null) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  return db
    .insert(workouts)
    .values({ userId, name, date, notes })
    .returning()
}

export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))

  return workout ?? null
}

export async function updateWorkout(
  workoutId: string,
  name: string | null,
  date: string,
  notes: string | null,
) {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  return db
    .update(workouts)
    .set({ name, date, notes, updatedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning()
}
