'use server'

import { z } from 'zod'
import { createWorkout } from '@/data/workouts'

const CreateWorkoutSchema = z.object({
  name: z.string().max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: z.string().optional(),
})

export async function createWorkoutAction(
  name: string,
  date: string,
  notes: string,
) {
  const result = CreateWorkoutSchema.safeParse({ name: name || undefined, date, notes: notes || undefined })
  if (!result.success) {
    return { error: result.error.flatten() }
  }

  const [workout] = await createWorkout(
    result.data.name ?? null,
    result.data.date,
    result.data.notes ?? null,
  )

  return { date: workout.date }
}
