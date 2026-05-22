'use server'

import { z } from 'zod'
import { updateWorkout } from '@/data/workouts'

const UpdateWorkoutSchema = z.object({
  workoutId: z.string().min(1),
  name: z.string().max(255).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: z.string().optional(),
})

export async function updateWorkoutAction(
  workoutId: string,
  name: string,
  date: string,
  notes: string,
) {
  const result = UpdateWorkoutSchema.safeParse({
    workoutId,
    name: name || undefined,
    date,
    notes: notes || undefined,
  })

  if (!result.success) {
    return { error: result.error.flatten() }
  }

  const [workout] = await updateWorkout(
    result.data.workoutId,
    result.data.name ?? null,
    result.data.date,
    result.data.notes ?? null,
  )

  return { date: workout.date }
}
