# Architecture Overview

## App Entry & Composition

- **Root layout**: `src/app/layout.tsx` wires global metadata, fonts, and shared chrome (`Header`, `Footer`).
- **Providers**: `src/app/Providers.tsx` wraps the tree with TanStack Query, theme, tooltip, and toast providers. Feature providers (e.g., optimizer state) live inside feature routes.
- **Styling**: Tailwind CSS via `globals.css` plus shadcn/ui components located under `src/shared/components/ui`.

## Routing

- **App router**: Next.js 15 app directory with the following public routes:
  - `/` – optimizer flow.
  - `/how-it-works` – explainer.
  - `/holidays` and nested dynamic segments for country/state/region holiday pages.
  - `/privacy`, `/terms`, plus auto-generated `sitemap.ts` and `robots.ts`.
- Route components now import shared layout primitives via `@/shared/components/layout` and feature modules via `@/features/*`.

## Feature Modules

- **Optimizer (`src/features/optimizer`)**
  - `components/` – form steps, results view, and modular sub-components (`common/`, `company-days-date-list/`, `holidays-date-list/`).
  - `context/OptimizerContext.tsx` – reducer-driven state for PTO planning.
  - `hooks/useOptimizer.ts` – single `useOptimizerForm` hook exposing state slices and typed actions; `useLocalStorage` handles persistence.
  - `lib/storage/` – localStorage helpers for holidays and company days.
- **Holidays (`src/features/holidays`)**
  - `components/` – country search and holiday detail pages.
  - `hooks/useHolidayQueries.ts` – TanStack Query hooks for `date-holidays` data.
  - `lib/location-storage.ts` – location persistence shared between optimizer and holiday routes.

## Data Layer

- `src/services/optimizer.ts` – pure algorithm that produces optimized schedules from PTO/holiday inputs.
- `src/services/holidays.ts` – fetches country/state/region data via `date-holidays` (server-only).
- Client components consume data through React Query hooks (`useHolidayQueries`) or context actions (`useOptimizerForm`).

## Shared Layer

- `src/shared/components` – global UI primitives (shadcn/ui with tailwind-merge) and layout elements (header, footer, theme toggle, JSON-LD helpers).
- `src/shared/hooks` – cross-cutting utilities such as `use-is-mobile`.
- `src/shared/lib/utils.ts` – className helpers, design tokens, and color mappings used by multiple features.

## State Management & Side Effects

- Optimizer reducer centralizes form state, with deterministic actions (`SET_DAYS`, `ADD_HOLIDAY`, etc.).
- `useOptimizerForm` provides memoized action creators so components avoid dispatch boilerplate.
- Local storage sync is encapsulated in `useLocalStorage`, coordinating persistence per selected year.
- React Query caches holiday lookups, and `Providers` disables refetch-on-focus for stability.

## Conventions

- Absolute imports via `@/features/*` and `@/shared/*` for discoverability.
- Components prefer literal props over HOCs; hooks live beside their feature.
- UI components remain presentational and expect domain objects from feature hooks.
- Tests run with Jest/RTL; linting via `pnpm lint`; formatting via `pnpm format:write`.
