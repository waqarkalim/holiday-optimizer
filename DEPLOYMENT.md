# Deployment Guide

Deploy Holiday Optimizer to Cloudflare Pages using the current Next.js 16 build pipeline.

## Infrastructure Overview

- Cloudflare Pages handles CI/CD from GitHub.
- Static assets are served globally via Cloudflare's CDN with automatic HTTPS.
- No additional server configuration is required.

## Deployment Setup

### 1. Cloudflare Account Setup

1. Create or sign in to your Cloudflare account.
2. Open the Cloudflare Dashboard and navigate to **Pages**.

### 2. Connect to GitHub

1. Click **Create a project**.
2. Choose **Connect to Git**.
3. Authorise Cloudflare to access your GitHub repositories (if prompted).
4. Select the `holiday-optimizer` repository.

### 3. Configure Build Settings

In the project configuration:

- **Project name**: `holiday-optimizer` (or any alias you prefer).
- **Production branch**: `main` (match your primary release branch).
- **Framework preset**: Next.js.
- **Build command**: `pnpm build`.
- **Output directory**: leave blank (Cloudflare uploads the `.next` output automatically).
- **Environment variables**:
  - `NODE_VERSION=20`
  - `PNPM_VERSION=10.6.3`
  - Add any `NEXT_PUBLIC_*` values or analytics IDs your deployment requires.

Save the configuration and trigger the initial deployment.

## Development Workflow

1. Develop locally and run the usual checks:
   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```
2. Push your changes to GitHub.
3. Cloudflare Pages will:
   - Install dependencies with pnpm.
   - Execute `pnpm build` (which internally runs `scripts/build.mjs` to force the Webpack pipeline mandated by Cloudflare).
   - Publish a preview deployment for the commit/PR, and update production when the main branch changes.

## Advanced Configuration

### Custom Domains

1. In the Cloudflare Pages project, open **Custom domains**.
2. Click **Set up a custom domain** and follow the verification prompts.

### Environment Variables

1. Navigate to **Settings → Environment variables**.
2. Add variables for the Production and Preview environments as needed.

### Build Configuration

Most deployments do not need a `wrangler.toml`. Only add one if you require custom headers, redirects, or Worker bindings.

## Troubleshooting

- **Build failures**: review the Cloudflare build logs to ensure pnpm installed correctly and the Node version is set to 20.
- **Font downloads**: the build fetches Google Fonts; if the environment blocks outbound requests, vendor the fonts locally.
- **Preview deployments**: verify the GitHub integration still has access to the repository and that the selected branch matches your workflow.

## Monitoring & Maintenance

- Monitor build and deployment status from the Cloudflare Dashboard.
- Keep an eye on Cloudflare Analytics for traffic and error trends.
- Regularly run `pnpm update` locally to stay current with dependencies before redeploying.
