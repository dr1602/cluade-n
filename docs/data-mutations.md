# Data Mutations

## Rule: All database mutations go through `/data` helpers

Never write to the database directly from a Server Action, page, or component. Every mutation must live in a helper function inside the `src/data` directory that wraps the Drizzle ORM call.

```
src/data/
  exercises.ts
  workouts.ts
  ...
```

```ts
// CORRECT — mutation lives in src/data
import { db } from '@/lib/db'
import { exercises } from '@/lib/schema'

export async function createExercise(name: string, userId: string) {
  return db.insert(exercises).values({ name, userId }).returning()
}

// WRONG — never call db directly from an action or component
import { db } from '@/lib/db'
await db.insert(exercises).values({ name, userId })
```

## Rule: All mutations must go through Server Actions

Never mutate data via route handlers (`app/api/*/route.ts`) or client-side `fetch` calls. Every write operation must be a Server Action.

## Rule: Server Actions must live in colocated `actions.ts` files

Place Server Actions in an `actions.ts` file colocated with the route or feature that uses them — not in a shared global file unless the action is genuinely shared across multiple routes.

```
app/
  dashboard/
    workouts/
      page.tsx
      actions.ts   ← Server Actions for this route
```

Every `actions.ts` file must begin with `'use server'`.

```ts
// app/dashboard/workouts/actions.ts
'use server'

import { createWorkout } from '@/data/workouts'

export async function createWorkoutAction(...) { ... }
```

## Rule: Server Action params must be typed — no `FormData`

All Server Action parameters must use explicit TypeScript types. Do not accept `FormData` as a parameter type.

```ts
// CORRECT
export async function createWorkoutAction(name: string, scheduledAt: Date) { ... }

// WRONG — FormData is not allowed
export async function createWorkoutAction(data: FormData) { ... }
```

## Rule: All Server Actions must validate arguments with Zod

Every Server Action must parse and validate its arguments with a Zod schema before doing anything else. Do not trust caller-supplied values.

```ts
'use server'

import { z } from 'zod'
import { createWorkout } from '@/data/workouts'

const CreateWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  scheduledAt: z.date(),
})

export async function createWorkoutAction(name: string, scheduledAt: Date) {
  const parsed = CreateWorkoutSchema.parse({ name, scheduledAt })
  return createWorkout(parsed.name, parsed.scheduledAt)
}
```

Use `safeParse` when you want to return a structured error to the caller instead of throwing:

```ts
export async function createWorkoutAction(name: string, scheduledAt: Date) {
  const result = CreateWorkoutSchema.safeParse({ name, scheduledAt })
  if (!result.success) {
    return { error: result.error.flatten() }
  }
  return createWorkout(result.data.name, result.data.scheduledAt)
}
```

## Rule: Never redirect inside a Server Action — redirect client-side

Do not call `redirect()` from `next/navigation` inside a Server Action. Instead, return data from the action and perform the redirect in the Client Component after the action resolves.

```ts
// CORRECT — return data, let the client redirect
export async function createWorkoutAction(name: string, date: string, notes: string) {
  const result = CreateWorkoutSchema.safeParse({ name, date, notes })
  if (!result.success) {
    return { error: result.error.flatten() }
  }
  const [workout] = await createWorkout(result.data.name ?? null, result.data.date, result.data.notes ?? null)
  return { date: workout.date }
}

// WRONG — do not redirect inside a Server Action
export async function createWorkoutAction(name: string, date: string, notes: string) {
  const [workout] = await createWorkout(name, date, notes)
  redirect(`/dashboard?date=${workout.date}`) // never do this
}
```

In the Client Component, use the router to redirect after the action resolves:

```tsx
'use client'
import { useRouter } from 'next/navigation'

const router = useRouter()

startTransition(async () => {
  const result = await createWorkoutAction(name, date, notes)
  if (result && 'date' in result) {
    router.push(`/dashboard?date=${result.date}`)
  }
})
```

## Summary

| Concern | Rule |
|---|---|
| Where mutations live | `src/data` helper functions wrapping Drizzle ORM |
| How to trigger mutations | Server Actions only — no route handlers or client fetch |
| Where to put Server Actions | Colocated `actions.ts` files with `'use server'` at the top |
| Parameter types | Explicit TypeScript types — `FormData` is not allowed |
| Input validation | Zod schema — validate before any other logic |
| Redirects after mutation | Client-side via `router.push` — never `redirect()` inside a Server Action |
