'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { addExerciseAction } from './actions'
import type { ExerciseCatalog } from '@/app/db/schema'

export function AddExerciseForm({
  workoutId,
  exerciseCatalog,
}: {
  workoutId: string
  exerciseCatalog: ExerciseCatalog[]
}) {
  const [exerciseId, setExerciseId] = useState<string>('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit() {
    if (!exerciseId) return
    startTransition(async () => {
      const result = await addExerciseAction(workoutId, exerciseId)
      if (result && 'success' in result) {
        setExerciseId('')
        router.refresh()
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={exerciseId} onValueChange={setExerciseId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an exercise" />
        </SelectTrigger>
        <SelectContent>
          {exerciseCatalog.map((exercise) => (
            <SelectItem key={exercise.id} value={exercise.id}>
              {exercise.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" onClick={handleSubmit} disabled={!exerciseId || isPending}>
        {isPending ? 'Adding…' : 'Add exercise'}
      </Button>
    </div>
  )
}
