# Server Components

## Rule: All pages and layouts are Server Components by default

Do not add `'use client'` to a page or layout unless you explicitly need state, event handlers, lifecycle hooks, or browser APIs. Keep as much of the tree as possible on the server.

## Rule: `params` and `searchParams` are Promises — always await them

In Next.js 15+, `params` and `searchParams` are **Promises**. Accessing them without `await` will return the Promise object, not the values.

```tsx
// CORRECT
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  // use workoutId ...
}

// CORRECT — searchParams follows the same rule
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  // use date ...
}

// WRONG — params is a Promise, not a plain object
export default async function Page({
  params,
}: {
  params: { workoutId: string }   // ← wrong type
}) {
  const { workoutId } = params    // ← will not work
}
```

Always type `params` and `searchParams` as `Promise<{...}>` and destructure after `await`.

## Rule: Never use `useParams` or `useSearchParams` in Server Components

These are React hooks for Client Components only. In a Server Component, get dynamic values directly from the awaited `params` / `searchParams` props.

## Rule: Pass data down as props — never fetch in Client Components

Fetch all data in the Server Component, then pass it to Client Components as props. See `/docs/data-fetching.md` for the full rule.

```tsx
// CORRECT — fetch in the Server Component, pass as props
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
  const workout = await getWorkoutById(workoutId)

  return <EditWorkoutForm workout={workout} />
}

// WRONG — do not fetch inside the Client Component
'use client'
export function EditWorkoutForm({ workoutId }: { workoutId: string }) {
  const [workout, setWorkout] = useState(null)
  useEffect(() => { fetch(`/api/workouts/${workoutId}`).then(...) }, [])
}
```

## Rule: Use `notFound()` for missing or unauthorized records

When a data helper returns `null` (record not found or belongs to another user), call `notFound()` from `next/navigation` to render the nearest not-found boundary.

```tsx
import { notFound } from 'next/navigation'

const workout = await getWorkoutById(workoutId)
if (!workout) notFound()
```

## Summary

| Concern | Rule |
|---|---|
| `params` / `searchParams` type | `Promise<{...}>` — always |
| Accessing `params` / `searchParams` | `await` before destructuring |
| Data fetching | Server Component only — pass results as props |
| Missing records | Call `notFound()` |
| Hooks (`useParams`, `useSearchParams`) | Client Components only — never in Server Components |
