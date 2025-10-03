# Deployment Guide

This guide explains how to deploy the Holiday Optimizer application to Cloudflare Pages.

## Infrastructure Overview

The application uses Cloudflare Pages for hosting:

- Automatic builds and deployments directly from GitHub
- Global CDN for fast content delivery
- Automatic HTTPS/SSL
- Scalable hosting with no infrastructure management

## Deployment Setup

### 1. Cloudflare Account Setup

1. Create a Cloudflare account if you don't have one
2. Navigate to the Cloudflare Dashboard > Pages

### 2. Connect to GitHub

1. Click "Create a project" in Cloudflare Pages
2. Choose "Connect to Git"
3. Authorize Cloudflare to access your GitHub repositories
4. Select the "holiday-optimizer" repository

### 3. Configure Build Settings

1. Configure the build settings:

   - **Project name**: holiday-optimizer (or your preferred name)
   - **Production branch**: master
   - **Framework preset**: Next.js
   - **Build command**: npm run build
   - **Build output directory**: out
   - **Environment variables** (if needed):
     - NODE_VERSION: 20
     - PNPM_VERSION: 10.6.3

2. Click "Save and Deploy"

## Development Workflow

1. Make changes to your codebase
2. Push to GitHub
3. Cloudflare automatically:
   - Detects the changes
   - Builds the application
   - Deploys to Cloudflare Pages
   - Issues a unique preview URL for each commit/PR

## Advanced Configuration

### Custom Domains

1. In the Cloudflare Pages project:
   - Go to "Custom domains"
   - Click "Set up a custom domain"
   - Enter your domain name
   - Follow the verification steps

### Environment Variables

1. For environment-specific settings:
   - Go to "Settings" > "Environment variables"
   - Add variables for Production and Preview environments

### Build Configuration

1. For more control over the build process:
   - Create a `wrangler.toml` file in the root
   - Specify detailed build configuration

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Check the build logs in Cloudflare Pages
   - Ensure all dependencies are correctly installed
   - Verify build commands match your project setup

2. **Node.js Version Mismatch**

   - Set NODE_VERSION environment variable in Cloudflare
   - Ensure compatibility with your code

3. **Preview Deployment Issues**
   - Check GitHub repository permissions
   - Verify webhook is properly configured

## Monitoring and Maintenance

- Monitor build and deployment status in Cloudflare Dashboard
- Check analytics for traffic patterns and errors
- Regular dependency updates through normal development workflow
