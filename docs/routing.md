# Routing Coding Standards

## Route structure

All application routes live under `/dashboard`. There are no top-level feature routes.

```
app/
  page.tsx                          # redirects to /dashboard
  dashboard/
    page.tsx                        # /dashboard
    workout/
      new/page.tsx                  # /dashboard/workout/new
      [workoutId]/page.tsx          # /dashboard/workout/:workoutId
```

Do not create routes outside of `/dashboard` for app features.

## Route protection

All `/dashboard` routes are protected. Protection is enforced exclusively via **Next.js middleware** — do not add page-level auth guards as a substitute.

Configure `middleware.ts` at the project root using Clerk (see `/docs/auth.md`):

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

Any route not listed in `isPublicRoute` is protected automatically. Never add `/dashboard` to the public matcher.

## Public routes

Only sign-in and sign-up are public:

- `/sign-in` (and sub-paths)
- `/sign-up` (and sub-paths)

## Redirects

The root `/` page should redirect unauthenticated users to `/sign-in` and authenticated users to `/dashboard`. Use Next.js `redirect()` from `next/navigation` in the root `page.tsx`.

```tsx
// app/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

export default async function RootPage() {
  const { userId } = await auth()
  redirect(userId ? '/dashboard' : '/sign-in')
}
```

## Dynamic segments

Use `[paramName]` folder segments for resource-level routes:

```
app/dashboard/workout/[workoutId]/page.tsx
```

`params` is a Promise in Next.js 16 — always await it:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  const { workoutId } = await params
}
```

## Summary

| Concern | Rule |
|---|---|
| App route root | All features under `/dashboard` |
| Route protection | Clerk middleware in `middleware.ts` — not page-level checks |
| Public routes | `/sign-in`, `/sign-up` only |
| Root `/` | Redirects to `/dashboard` or `/sign-in` based on auth state |
| Dynamic params | Always `await params` (Promise in Next.js 16) |
