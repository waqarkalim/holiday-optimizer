# Holiday Optimizer

A web application for optimizing holiday travel planning.

## Overview

Holiday Optimizer is a web application that helps users plan their holidays efficiently. By analyzing travel routes, costs, and optimal scheduling, the application provides recommendations for maximizing travel experiences while minimizing expenses and travel time.

## Features

- Interactive calendar visualization
- Cost comparison between different travel options
- Automatic optimization of travel routes
- Shareable trip itineraries
- Weather forecast integration
- Accommodation recommendations
- Local attraction suggestions

## Technology Stack

This project is built with:

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **UI Components**: Shadcn UI
- **Styling**: TailwindCSS
- **Testing**: Jest, React Testing Library
- **Deployment**: Cloudflare Pages
- **CI/CD**: GitHub Actions for testing and quality assurance

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

## Contributing

1. Create a feature branch from `main`.
2. Make changes and ensure tests pass.
3. Submit a pull request.

### Guidelines

- Follow the existing code style and naming conventions.
- Write tests for new features and bug fixes.
- Keep pull requests focused on a single feature or fix.
- Document new features or changes in behavior.
