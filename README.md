![Solo Project](https://img.shields.io/badge/project-solo-blue.svg)

> 🚫 **Solo Project** – I’m not accepting contributions at this time.

# Holiday Optimizer

A web application for optimizing Paid Time Off (PTO) usage.

> 🔍 **Transparency Notice** – This codebase is public so others can review how the app works. It remains my personal project; please do not copy, deploy, rebrand, or monetize it without explicit permission.

## Overview

Holiday Optimizer helps users maximize their time off by intelligently planning PTO days around public and company holidays. By inputting your available PTO and selecting your location, the application generates an optimized schedule suggesting the best days to take off to create longer breaks throughout the year.

## Features

- Input your total available Paid Time Off (PTO) days.
- Select your country (and region/province, where applicable) to automatically fetch public holidays for a chosen year.
- Add custom company-specific non-working days.
- Choose an optimization strategy (e.g., maximize long weekends, distribute evenly).
- Generate a visual schedule highlighting suggested PTO days and resulting time-off blocks.
- Plan for the current or upcoming year.
- Responsive design for use on various devices.

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
   git clone https://github.com/yourusername/holiday-optimizer.git
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

## Development Workflow

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
