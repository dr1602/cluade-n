# UI Coding Standards

## Component Library

**Only shadcn/ui components are permitted.** Do not create custom UI components under any circumstances.

- Install components via the shadcn CLI: `npx shadcn@latest add <component>`
- Browse available components at the [shadcn/ui docs](https://ui.shadcn.com/docs/components)
- All installed components live in `components/ui/` — do not modify them directly

If a shadcn component does not exist for a given need, compose from existing shadcn primitives. Creating a bespoke component is not an option.

## Date Formatting

Use **date-fns** for all date formatting. No other date library is permitted.

Dates must follow this format: `yyyy MMM dd`

| Raw value | Formatted output |
|-----------|-----------------|
| 2026-01-01 | 2026 Jan 01 |
| 2025-09-12 | 2025 Sep 12 |
| 2021-08-28 | 2021 Aug 28 |

```ts
import { format } from "date-fns"

format(date, "yyyy MMM dd")
```
