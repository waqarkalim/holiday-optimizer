# Refactor Plan

## Current Pain Points
- **Fragmented layout**: Feature code is split across `src/components/features`, `src/contexts`, `src/hooks`, `src/lib`, and `src/services`, making it hard to follow the optimizer flow end-to-end. Shared UI also lives under `src/components`, mixing feature-specific and reusable pieces.
- **Over-layered optimizer state**: `OptimizerContext` feeds five thin custom hooks (`useDaysInput`, `useStrategySelection`, etc.) plus `useLocalStorage`, creating indirection and redundant dispatch calls for simple operations.
- **Storage utilities scattered**: `src/lib/storage/*` is purely optimizer-specific but sits in a generic `lib` folder. Holidays location storage also lives there, obscuring ownership.
- **Verbose components**: Key components (e.g., `ResultsDisplay`, `CalendarView`, form steps) contain excessive comments, blank space, and repetitive styling helpers that hide the intent.
- **Dead abstractions**: `src/utils/fp.ts` implements pipe/filter/map wrappers that are unused. There are also multiple export paths for similar helpers (`lib/utils`, inline styling helpers) that can be simplified.

## Proposed Simplifications
- **Adopt feature-first layout**: Create `src/features/optimizer` and `src/features/holidays`, each with `components/`, `hooks/`, `context/`, and `lib/` subfolders. Move optimizer-related storage utilities into the feature. Centralize reusable UI/layout/theme code beneath `src/shared/components` and shared hooks/lib under `src/shared`.
- **Consolidate optimizer state access**: Keep the reducer/provider but replace the suite of micro-hooks with a single `useOptimizerForm` hook that exposes slices (`days`, `strategy`, etc.) and actions. Co-locate `useLocalStorage` with the feature and ensure effects run through the new hook when needed.
- **Clarify component intent**: Trim redundant comments, normalize prop naming, and collapse obvious wrappers (e.g., forwardRef only where needed). Ensure all imports use the new folder structure and keep components focused on rendering logic.
- **Remove unused helpers**: Delete `src/utils/fp.ts` and any dangling imports. Fold simple style helpers into the components that need them or group them in `src/shared/lib/ui.ts` if reused.
- **Documentation & scripts**: Provide updated architecture, refactor notes (with parity proof), and onboarding docs. Ensure lint/test scripts are documented and add a `format` script if missing.

## Risks & Mitigations
- **Broken import paths after moves**: The refactor touches many files. Mitigate with incremental moves (optimizer first, then holidays), TypeScript compile (Next build) and Jest run.
- **Context side-effects**: Changing hook wiring risks altering localStorage behavior. Keep reducer logic intact, add unit coverage if feasible, and smoke-test through `pnpm test` plus manual parity checks noted in REFACTOR_NOTES.
- **Large diffs**: Folder moves can bloat diffs. Tackle in two PR-sized chunks (structure, then state cleanup) and keep move commits clean to aid review.

## Change Sequence
1. **Restructure filesystem**: Introduce `shared/` and `features/` directories; move optimizer components, context, hooks, and storage utilities; repoint imports.
2. **Move holidays feature**: Relocate holiday components/pages helpers into `src/features/holidays` and update route imports.
3. **State & hooks cleanup**: Replace micro-hooks with `useOptimizerForm`, adjust components to use the new API, and simplify local storage sync.
4. **Remove dead utilities & tighten components**: Delete unused helpers, streamline components (comments, redundant props), and ensure naming is consistent.
5. **Documentation & verification**: Draft `ARCHITECTURE.md`, `REFACTOR_NOTES.md`, `CONTRIBUTING.md`, record parity checks, and run `pnpm lint`, `pnpm test`, and `pnpm build` as safety nets.

