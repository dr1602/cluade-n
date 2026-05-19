'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createWorkoutAction } from './actions'

export function NewWorkoutForm({ defaultDate }: { defaultDate: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = data.get('name') as string
    const date = data.get('date') as string
    const notes = data.get('notes') as string
    startTransition(async () => {
      const result = await createWorkoutAction(name, date, notes)
      if (result && 'date' in result) {
        router.push(`/dashboard?date=${result.date}`)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workout name</Label>
        <Input id="name" name="name" placeholder="e.g. Push day" maxLength={255} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required defaultValue={defaultDate} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" placeholder="Optional notes..." rows={4} />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create workout'}
      </Button>
    </form>
  )
}
