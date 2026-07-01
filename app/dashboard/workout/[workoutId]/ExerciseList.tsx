'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createSetAction, deleteSetAction, removeExerciseAction } from './actions'
import type { getWorkoutExercisesWithSets } from '@/data/sets'

type WorkoutExercises = Awaited<ReturnType<typeof getWorkoutExercisesWithSets>>

export function ExerciseList({ workoutExercises }: { workoutExercises: WorkoutExercises }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRemoveExercise(workoutExerciseId: string) {
    startTransition(async () => {
      await removeExerciseAction(workoutExerciseId)
      router.refresh()
    })
  }

  function handleDeleteSet(setId: string) {
    startTransition(async () => {
      await deleteSetAction(setId)
      router.refresh()
    })
  }

  function handleLogSet(workoutExerciseId: string, form: HTMLFormElement) {
    const data = new FormData(form)
    const reps = parseNullableNumber(data.get('reps'))
    const weightKg = parseNullableNumber(data.get('weightKg'))

    startTransition(async () => {
      await createSetAction(workoutExerciseId, reps, weightKg, null, null, null, null)
      form.reset()
      router.refresh()
    })
  }

  if (workoutExercises.length === 0) {
    return <p className="text-sm text-muted-foreground">No exercises logged yet.</p>
  }

  return (
    <div className="space-y-4">
      {workoutExercises.map((workoutExercise) => (
        <Card key={workoutExercise.id}>
          <CardHeader>
            <CardTitle>{workoutExercise.exercise.name}</CardTitle>
            <CardAction>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => handleRemoveExercise(workoutExercise.id)}
              >
                Remove
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-4">
            {workoutExercise.sets.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Set</TableHead>
                    <TableHead>Reps</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workoutExercise.sets.map((set) => (
                    <TableRow key={set.id}>
                      <TableCell>{set.setNumber}</TableCell>
                      <TableCell>{set.reps ?? '—'}</TableCell>
                      <TableCell>{set.weightKg ?? '—'}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleDeleteSet(set.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <form
              className="flex items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                handleLogSet(workoutExercise.id, e.currentTarget)
              }}
            >
              <Input name="reps" type="number" min={0} placeholder="Reps" className="w-24" />
              <Input
                name="weightKg"
                type="number"
                min={0}
                step="0.5"
                placeholder="Weight (kg)"
                className="w-32"
              />
              <Button type="submit" disabled={isPending}>
                Log set
              </Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function parseNullableNumber(value: FormDataEntryValue | null) {
  if (value === null || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}
