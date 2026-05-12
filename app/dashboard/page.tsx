"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const MOCK_WORKOUTS = [
  { id: 1, name: "Morning Run", duration: "30 min", type: "Cardio" },
  { id: 2, name: "Upper Body Strength", duration: "45 min", type: "Strength" },
]

export default function DashboardPage() {
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Workout Dashboard</h1>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-64 justify-start gap-2">
            <CalendarIcon className="h-4 w-4" />
            {format(date, "yyyy MMM dd")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && setDate(d)}
          />
        </PopoverContent>
      </Popover>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Workouts for {format(date, "yyyy MMM dd")}
        </h2>

        {MOCK_WORKOUTS.length === 0 ? (
          <p className="text-muted-foreground">No workouts logged for this date.</p>
        ) : (
          <ul className="space-y-3">
            {MOCK_WORKOUTS.map((workout) => (
              <li
                key={workout.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{workout.name}</p>
                  <p className="text-sm text-muted-foreground">{workout.type}</p>
                </div>
                <span className="text-sm text-muted-foreground">{workout.duration}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
