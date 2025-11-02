![Solo Project](https://img.shields.io/badge/project-solo-blue.svg)

> 🚫 **Solo Project** – I’m not accepting contributions at this time.

# Holiday Optimizer

A web application for optimizing Paid Time Off (PTO) usage.

> 🔍 **Transparency Notice** – This codebase is public so others can review how the app works. It remains my personal project; please do not copy, deploy, rebrand, or monetize it without explicit permission.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Local Development](#local-development)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Deployment](#deployment)
- [Testing & Linting](#testing--linting)
- [Usage Policy](#usage-policy)
- [Contribution](#contribution)
- [License](#license)

## Overview

Holiday Optimizer helps users maximize their time off by intelligently planning PTO days around public and company holidays. By inputting your available PTO, selecting your location, and flagging the weekdays you can comfortably work remotely, the application generates an optimized schedule suggesting the best days to take off to create longer breaks throughout the year.

## Features

- Guided PTO planner that captures how many days off you can spend in a given year.
- Per-country holiday retrieval (with provincial/state awareness) powered by the `date-holidays` library.
- Custom company days to reflect internal shutdowns or unique holidays.
- Remote-work weekday selection so the planner can extend trips by inserting work-from-anywhere days without spending PTO.
- Optimization strategies that prioritize extended breaks, long weekends, or even distribution.
- Calendar, stats, and summary cards that highlight recommended PTO combinations.
- Optionally export shareable artifacts such as `.ics` calendar events.
- Responsive UI designed to work smoothly on desktop, tablet, and mobile.

## How It Works

The optimizer combines built-in calendars with your inputs to recommend time off:

1. Public holidays are fetched and cached via TanStack Query when you choose a location.
2. Custom company days, remote-friendly weekdays, and weekends are merged into a working calendar.
3. The algorithm in `src/services/optimizer.ts` scans permutations of PTO days alongside remote-work days to build contiguous break windows.
4. Suggested PTO slots and the resulting breaks are visualized in the UI so you can review, tweak, or export them.

## Technology Stack

This project is built with:

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui primitives with custom wrappers
- **Data Fetching & Caching**: TanStack Query
- **Notifications**: Sonner (toasts)
- **Testing**: Jest + React Testing Library (baseline suite)
- **Deployment**: Cloudflare Pages
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/popcsev/holiday-optimizer.git
   cd holiday-optimizer
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configuration

Holiday Optimizer works with zero configuration. Optionally, you can create a `.env.local` file with:

```bash
NEXT_PUBLIC_BASE_URL=https://holiday-optimizer.com
```

Set this value to the canonical URL of your deployment so generated metadata (Open Graph, sitemap, etc.) points to the right domain.

### Local Development

- Start the dev server with live reload: `pnpm dev`
- Run a production build locally: `pnpm build && pnpm start`
- Update formatting once you are happy with your changes: `pnpm format:write`

## Scripts

Commonly used scripts defined in `package.json`:

| Command | Description |
| --- | --- |
| `pnpm dev` | Run Next.js locally with Turbopack. |
| `pnpm build` | Execute the Cloudflare-compatible build pipeline. |
| `pnpm start` | Serve the production build. |
| `pnpm lint` | Run the ESLint ruleset. |
| `pnpm format` / `pnpm format:write` | Check or apply Prettier formatting. |
| `pnpm test` | Run the Jest suite (passes with no tests). |
| `pnpm test:unit` / `pnpm test:integration` / `pnpm test:e2e` | Scoped test runs. |
| `pnpm test:coverage` | Generate a coverage report. |

## Deployment

This application is deployed to Cloudflare Pages. For deployment details, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Project Structure

```
holiday-optimizer/
├── public/                     # Static assets, favicons, social images
├── scripts/                    # Build and tooling scripts
├── src/
│   ├── app/                    # Next.js routes and layouts
│   ├── features/
│   │   ├── optimizer/          # Optimizer UI, hooks, context, services
│   │   └── holidays/           # Holiday lookup UI and hooks
│   ├── shared/
│   │   ├── components/         # Layout + shadcn-based primitives
│   │   ├── hooks/              # Reusable hooks (e.g., is-mobile)
│   │   └── lib/                # Styling utilities, helpers
│   ├── services/               # Algorithms and data helpers
│   ├── types/                  # TypeScript types
│   └── utils/                  # Cross-feature utilities (dates, tracking)
└── tests/                      # Jest test suites
```

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) – High-level overview of feature modules, routing, and conventions.
- [DEPLOYMENT.md](DEPLOYMENT.md) – Step-by-step guide for Cloudflare Pages.
- [CONTRIBUTING.md](CONTRIBUTING.md) – Additional notes on the project’s solo-maintained policy.

## Testing & Linting

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test categories
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Generate test coverage report
pnpm test:coverage
```

### Linting and Formatting

```bash
# Run linter
pnpm lint

# Format code
pnpm format
```

## Usage Policy

This repository is published for transparency so others can review how the application works. **All rights remain with Waqar Bin Kalim.**

- © 2025 Waqar Bin Kalim. All rights reserved.
- You may read and learn from the code, but you may **not** copy, fork, host, deploy, redistribute, rebrand, or commercialize this project—whether in its original form or in modified/“revamped” versions—without written permission.
- Automated rewrites or derivative deployments created with AI tooling are equally prohibited unless you have an explicit license from me.
- If you’re interested in collaboration or licensing, please contact me directly.

## Contribution

Thank you for your interest! This repository is maintained solely by me.

- Pull requests and issues will be closed without merge.
- If you spot a bug, feel free to reach out privately or open a discussion, but please don’t submit patches.
- If you’d like to support the project, a ⭐ is appreciated.

## License

This project is currently unlicensed. All rights reserved.
