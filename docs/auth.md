# Authentication Coding Standards

## Provider

**This app uses Clerk for all authentication.** Do not implement custom auth, sessions, JWTs, or any other auth mechanism.

- Install and configure via the [Clerk Next.js SDK](https://clerk.com/docs/quickstarts/nextjs)
- All auth primitives (session resolution, user identity, route protection) come from Clerk

## Reading the current user

**In Server Components and `/data` helpers**, use `auth()` from `@clerk/nextjs/server`:

```ts
import { auth } from '@clerk/nextjs/server'

const { userId } = await auth()
if (!userId) throw new Error('Unauthenticated')
```

**In Client Components**, use the `useUser` or `useAuth` hooks:

```tsx
'use client'
import { useUser } from '@clerk/nextjs'

export function UserGreeting() {
  const { user } = useUser()
  return <p>Hello, {user?.firstName}</p>
}
```

Never pass `userId` as a prop or query param to resolve identity — always read it from Clerk directly at the point of use.

## Protecting routes

Use Clerk middleware to protect routes. Configure it in `middleware.ts` at the project root:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
}
```

Do not rely on page-level checks alone — middleware is the authoritative gate.

## Sign-in and sign-up pages

Use Clerk's hosted components. Do not build custom sign-in or sign-up forms.

```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return <SignIn />
}
```

```tsx
// app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return <SignUp />
}
```

## User identity in data helpers

Every `/data` helper that touches user-owned data must resolve `userId` from Clerk internally — never accept it as a parameter from the caller.

```ts
// CORRECT — resolves identity internally
import { auth } from '@clerk/nextjs/server'

export async function getUserWorkouts() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')

  return db.select().from(workouts).where(eq(workouts.userId, userId))
}

// WRONG — never accept userId from the caller
export async function getUserWorkouts(userId: string) { ... }
```

This rule exists to prevent IDOR vulnerabilities where a caller could supply an arbitrary user ID and access another user's data.

## Environment variables

Clerk requires two environment variables. Add them to `.env.local` — never commit them.

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Optionally set redirect URLs:

```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Summary

| Concern | Rule |
|---|---|
| Auth provider | Clerk — no custom auth |
| Server-side identity | `auth()` from `@clerk/nextjs/server` |
| Client-side identity | `useUser` / `useAuth` hooks |
| Route protection | Clerk middleware in `middleware.ts` |
| Sign-in / sign-up UI | Clerk hosted components only |
| `userId` in data helpers | Resolved from Clerk internally — never a parameter |
| Secrets | `.env.local` only — never committed |
