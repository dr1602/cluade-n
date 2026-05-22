# Data Fetching

## Rule: Server Components only

**All data fetching must happen exclusively in Server Components.**

Do not fetch data in:
- Route handlers (`app/api/*/route.ts`)
- Client Components (`'use client'`)
- Middleware
- Any other mechanism

If a Client Component needs data, fetch it in a parent Server Component and pass it down as props.

```tsx
// CORRECT — fetch in a Server Component, pass down as props
export default async function Page() {
  const exercises = await getUserExercises()
  return <ExerciseList exercises={exercises} />
}

// WRONG — do not fetch in a Client Component
'use client'
export default function ExerciseList() {
  const [exercises, setExercises] = useState([])
  useEffect(() => { fetch('/api/exercises').then(...) }, []) // never do this
}
```

## Rule: All database queries go through `/data` helpers

Never query the database directly from a page or component. Every database operation must live in a helper function inside the `/data` directory.

```
/data
  exercises.ts
  calendar.ts
  ...
```

Each helper function is the single place responsible for one query. Pages import and call these helpers — nothing else touches the database.

## Rule: Use Drizzle ORM — no raw SQL

All queries inside `/data` helpers must use Drizzle ORM. Do not write raw SQL strings under any circumstances.

```ts
// CORRECT
import { db } from '@/lib/db'
import { exercises } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function getUserExercises(userId: string) {
  return db.select().from(exercises).where(eq(exercises.userId, userId))
}

// WRONG — never do this
const rows = await db.execute(sql`SELECT * FROM exercises WHERE user_id = ${userId}`)
```

## Rule: Users can only access their own data

Every `/data` helper that returns user-owned records **must** filter by the authenticated user's ID. This is not optional — it is a security requirement.

1. Resolve the current user inside the helper (e.g., from the session).
2. Always include a `userId` equality condition in the query.
3. Never accept a caller-supplied `userId` that has not been validated against the session.

```ts
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { exercises } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function getUserExercises() {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthenticated')

  return db
    .select()
    .from(exercises)
    .where(eq(exercises.userId, session.user.id)) // always scope to the current user
}
```

Never omit the `userId` filter. A missing filter exposes every user's data to whoever calls the function.

## Summary

| Concern | Rule |
|---|---|
| Where to fetch | Server Components only |
| Where queries live | `/data` helper functions |
| How to query | Drizzle ORM — no raw SQL |
| Data access scope | Current user's data only, enforced inside every helper |
