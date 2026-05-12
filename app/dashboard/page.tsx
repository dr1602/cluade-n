import { format, parseISO } from 'date-fns'
import { getWorkoutsForDate } from '@/data/workouts'
import { WorkoutDatePicker } from '@/components/dashboard/WorkoutDatePicker'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date: dateParam } = await searchParams
  const dateStr = dateParam ?? format(new Date(), 'yyyy-MM-dd')
  const selectedDate = parseISO(dateStr)
  const workouts = await getWorkoutsForDate(dateStr)

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Workout Dashboard</h1>

      <WorkoutDatePicker selected={selectedDate} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Workouts for {format(selectedDate, 'yyyy MMM dd')}
        </h2>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground">No workouts logged for this date.</p>
        ) : (
          <ul className="space-y-3">
            {workouts.map((workout) => (
              <li
                key={workout.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{workout.name ?? 'Untitled workout'}</p>
                  {workout.notes && (
                    <p className="text-sm text-muted-foreground">{workout.notes}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
