'use server'

import { z } from 'zod'
import { updateWorkout } from '@/data/workouts'
import { addExerciseToWorkout, removeWorkoutExercise } from '@/data/exercises'
import { createSet, deleteSet, updateSet } from '@/data/sets'

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

const AddExerciseSchema = z.object({
  workoutId: z.string().uuid(),
  exerciseId: z.string().uuid(),
})

export async function addExerciseAction(workoutId: string, exerciseId: string) {
  const result = AddExerciseSchema.safeParse({ workoutId, exerciseId })
  if (!result.success) return { error: result.error.flatten() }

  await addExerciseToWorkout(result.data.workoutId, result.data.exerciseId)
  return { success: true }
}

const RemoveExerciseSchema = z.object({
  workoutExerciseId: z.string().uuid(),
})

export async function removeExerciseAction(workoutExerciseId: string) {
  const result = RemoveExerciseSchema.safeParse({ workoutExerciseId })
  if (!result.success) return { error: result.error.flatten() }

  await removeWorkoutExercise(result.data.workoutExerciseId)
  return { success: true }
}

const SetFieldsSchema = z.object({
  reps: z.number().int().min(0).nullable(),
  weightKg: z.number().min(0).nullable(),
  durationSeconds: z.number().int().min(0).nullable(),
  restSeconds: z.number().int().min(0).nullable(),
  rpe: z.number().min(0).max(10).nullable(),
  notes: z.string().max(500).nullable(),
})

const CreateSetSchema = SetFieldsSchema.extend({
  workoutExerciseId: z.string().uuid(),
})

export async function createSetAction(
  workoutExerciseId: string,
  reps: number | null,
  weightKg: number | null,
  durationSeconds: number | null,
  restSeconds: number | null,
  rpe: number | null,
  notes: string | null,
) {
  const result = CreateSetSchema.safeParse({
    workoutExerciseId,
    reps,
    weightKg,
    durationSeconds,
    restSeconds,
    rpe,
    notes,
  })
  if (!result.success) return { error: result.error.flatten() }

  const { workoutExerciseId: id, ...data } = result.data
  await createSet(id, data)
  return { success: true }
}

const UpdateSetSchema = SetFieldsSchema.extend({
  setId: z.string().uuid(),
})

export async function updateSetAction(
  setId: string,
  reps: number | null,
  weightKg: number | null,
  durationSeconds: number | null,
  restSeconds: number | null,
  rpe: number | null,
  notes: string | null,
) {
  const result = UpdateSetSchema.safeParse({
    setId,
    reps,
    weightKg,
    durationSeconds,
    restSeconds,
    rpe,
    notes,
  })
  if (!result.success) return { error: result.error.flatten() }

  const { setId: id, ...data } = result.data
  await updateSet(id, data)
  return { success: true }
}

const DeleteSetSchema = z.object({
  setId: z.string().uuid(),
})

export async function deleteSetAction(setId: string) {
  const result = DeleteSetSchema.safeParse({ setId })
  if (!result.success) return { error: result.error.flatten() }

  await deleteSet(result.data.setId)
  return { success: true }
}
