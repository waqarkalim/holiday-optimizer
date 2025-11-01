# Architecture Overview

## App Entry & Composition

- **Root layout (`src/app/layout.tsx`)** wires global metadata, fonts, and shared chrome (`Header`, `Footer`).
- **Providers (`src/app/Providers.tsx`)** wrap the app with TanStack Query, tooltip context, and toast providers. Feature-level providers sit inside individual routes if required.
- **Styling** is managed with Tailwind CSS (see `globals.css`) and a small set of custom wrappers around shadcn/ui primitives housed under `src/shared/components/ui`.

## Routing

- Built on the **Next.js 16 App Router**.
- Public routes currently shipped:
  - `/` – PTO optimizer flow (form + results).
  - `/how-it-works` – algorithm explainer and onboarding content.
  - `/privacy` and `/terms` – legal pages.
  - `sitemap.ts` and `robots.ts` – generated metadata endpoints.
- Notable route helpers: `not-found.tsx` redirects to `/`, and `Providers.tsx` lives beside `layout.tsx` to scope client providers.

## Feature Modules

- **Optimizer (`src/features/optimizer`)**
  - `components/` – form steps, results display (stats, calendar, break cards), and supporting UI fragments.
  - `context/OptimizerContext.tsx` – reducer-driven source of truth for the optimization form.
  - `hooks/useOptimizer.ts` – exposes the consolidated `useOptimizerForm` hook plus utilities (e.g., `useLocalStorage`).
  - `lib/` – date and storage helpers used by optimizer components.
- **Holidays (`src/features/holidays`)**
  - `components/` – dropdowns and lists when selecting locations/holidays.
  - `hooks/useHolidayQueries.ts` – TanStack Query hooks that hydrate holiday data using the `date-holidays` package.
  - `lib/location-storage.ts` – persists the user’s last known location selection.

## Data & Services Layer

- `src/services/optimizer.ts` – pure algorithm that analyzes PTO, weekends, holidays, and company days to build optimal break ranges.
- `src/services/holidays.ts` – helpers around the `date-holidays` library, shared across optimizer and holiday features.
- Shared utilities (`src/utils/`) cover date formatting, tracking events, and schema helpers.

## Shared Layer

- `src/shared/components` – layout primitives (Header, Footer, ReleaseBanner, JSON-LD components) and reusable UI pieces.
- `src/shared/hooks` – cross-cutting hooks such as viewport/touch detection.
- `src/shared/lib/utils.ts` – design tokens, color schemes, and helpers (`cn`, day-type color mapping, etc.).

## State Management & Side Effects

- Optimizer state is centralized in a reducer. Actions mutate a single store that is surfaced via `useOptimizerForm`.
- Local storage sync (`useLocalStorage`) persists optimizer form inputs per year.
- TanStack Query caches holiday data; refetch on focus is disabled for a smoother wizard experience.
- Toasting, analytics, and metadata live in shared utilities to avoid duplication.

## Conventions

- Absolute imports with `@/features/*`, `@/shared/*`, and `@/services/*` for clarity.
- Components favour props over HOCs; hooks co-locate with their feature.
- Stateless UI pieces stay presentational; data orchestration happens inside feature hooks/containers.
- Quality gates: `pnpm lint`, `pnpm test`, and `pnpm build` run before release.
