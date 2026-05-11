# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # ESLint
```

No test runner is configured.

## Stack

- **Next.js 16.2.6** with App Router — see `node_modules/next/dist/docs/` for authoritative API docs
- **React 19.2.4**
- **Tailwind CSS v4** (PostCSS plugin via `@tailwindcss/postcss`)
- **TypeScript 5**

## Architecture

Single-route app using the App Router:

- `app/layout.tsx` — root layout; sets Geist fonts as CSS variables, exports `metadata`
- `app/page.tsx` — home page (Server Component by default)
- `app/globals.css` — global styles and Tailwind imports

All layouts and pages are **Server Components by default**. Add `'use client'` only when you need state, event handlers, lifecycle hooks, or browser APIs.

## Key Next.js 16 differences from older versions

This version ships with a **new caching model**. The old `fetch`-level caching behavior has changed:

- To cache data or UI, use the `use cache` directive (enable via `cacheComponents: true` in `next.config.ts`)
- For the previous model (without `cacheComponents`), see `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`

For slow client-side navigations: Suspense alone is not enough — you must also export `unstable_instant` from the route. See `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md`.

Route params (`params`, `searchParams`) are now **Promises** and must be awaited:

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```
