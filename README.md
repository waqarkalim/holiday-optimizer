# Holiday Optimizer

A web application for optimizing Paid Time Off (PTO) usage.

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

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React
- **Styling**: TailwindCSS
- **UI Components**: Shadcn UI
- **Data Fetching**: React Query (TanStack Query)
- **Notifications**: Sonner (Toasts)
- **Testing**: Jest, React Testing Library (Planned/Setup)
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
├── .github/            # GitHub Actions workflows
├── .husky/             # Git hooks
├── public/             # Static assets
├── src/                # Application source code
│   ├── app/            # Next.js app router
│   ├── components/     # React components
│   ├── lib/            # Utility functions and shared logic
│   ├── styles/         # Global styles
│   └── types/          # TypeScript type definitions
└── tests/              # Test files
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

## License

This project is currently unlicensed. All rights reserved.
