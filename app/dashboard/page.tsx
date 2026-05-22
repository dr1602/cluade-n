import { format } from 'date-fns'
import Link from 'next/link'
import { getWorkoutsForDate } from '@/data/workouts'
import { WorkoutDatePicker } from './WorkoutDatePicker'
import { Button } from '@/components/ui/button'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const today = format(new Date(), 'yyyy-MM-dd')
  const selectedDate = date ?? today
  const selectedDateObj = new Date(`${selectedDate}T00:00:00`)

  const workouts = await getWorkoutsForDate(selectedDate)

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <WorkoutDatePicker selected={selectedDateObj} />
        <Button asChild>
          <Link href="/dashboard/workout/new">New workout</Link>
        </Button>
      </div>

      {workouts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No workouts for this day.</p>
      ) : (
        <ul className="space-y-3">
          {workouts.map((w) => (
            <li key={w.id} className="border rounded-lg p-4 space-y-1">
              <p className="font-medium">{w.name ?? 'Untitled workout'}</p>
              {w.notes && <p className="text-sm text-muted-foreground">{w.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
