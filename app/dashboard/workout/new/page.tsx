import { format } from 'date-fns'
import { NewWorkoutForm } from './NewWorkoutForm'

export default function NewWorkoutPage() {
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="max-w-lg mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">New workout</h1>
      <NewWorkoutForm defaultDate={today} />
    </div>
  )
}
