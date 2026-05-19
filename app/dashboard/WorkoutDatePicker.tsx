'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function WorkoutDatePicker({ selected }: { selected: Date }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSelect(d: Date | undefined) {
    if (!d) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', format(d, 'yyyy-MM-dd'))
    router.push(`?${params.toString()}`)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-64 justify-start gap-2">
          <CalendarIcon className="h-4 w-4" />
          {format(selected, 'yyyy MMM dd')}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  )
}
