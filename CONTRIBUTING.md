# Contributing Guide

## Prerequisites

- Node version from `.nvmrc` (or the version required by Next 15/React 19).
- `pnpm` workspace tooling (install via `npm install -g pnpm`).

Install dependencies:

```bash
pnpm install
```

## Common Tasks

| Command             | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `pnpm dev`          | Run the Next.js dev server (Turbopack).                        |
| `pnpm lint`         | ESLint checks using Next's config.                             |
| `pnpm test`         | Jest + React Testing Library suite (`--passWithNoTests`).      |
| `pnpm format`       | Prettier dry run (`--check`).                                  |
| `pnpm format:write` | Apply Prettier formatting repo-wide.                           |
| `pnpm build`        | Production build (requires internet to download Google Fonts). |

## Project Layout

```
src/
  app/                  # Next.js routes
  features/
    optimizer/          # Optimizer components, hooks, reducer, storage helpers
    holidays/           # Holiday listings + data fetching hooks
  shared/
    components/         # Layout + shadcn UI primitives
    hooks/              # Cross-cutting React hooks
    lib/                # Styling utilities and design tokens
  services/             # Data/algorithm layer
  utils/                # Date + tracking helpers
```

## Adding a Feature

1. Identify the feature domain (`src/features/<name>`). Co-locate UI, hooks, and domain helpers within that folder.
2. Expose state via context/hooks when multiple components share it; prefer local state otherwise.
3. Use shared UI primitives from `@/shared/components/ui` for consistency.
4. Document new routes or domain modules in `ARCHITECTURE.md` as needed.
5. Update tests/linting before opening a PR. Include parity notes in `REFACTOR_NOTES.md` if behaviour verification changes.

## Pull Requests

- Follow Conventional Commits (e.g., `refactor(optimizer): collapse form hooks`).
- Keep PRs focused; prefer smaller batches per feature area.
- Include screenshots or parity notes for UI changes, even if stylistically identical.

Thanks for contributing!
