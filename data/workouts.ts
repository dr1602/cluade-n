import { auth } from '@/lib/auth'
import { db } from '@/app/db'
import { workouts } from '@/app/db/schema'
import { and, eq } from 'drizzle-orm'

export async function getWorkoutsForDate(date: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthenticated')

  return db
    .select()
    .from(workouts)
    .where(and(eq(workouts.userId, session.user.id), eq(workouts.date, date)))
}
