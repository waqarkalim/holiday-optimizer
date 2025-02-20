# CTO Planner

A static web application that helps professionals optimize their vacation days. Built with Next.js and hosted on AWS.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## 🏗️ Deployment Setup

The application uses AWS for hosting and GitHub Actions for CI/CD. Here's how to set it up:

### Prerequisites

- AWS Account
- GitHub Account
- Node.js 20+
- pnpm 8.15.1+
- Terraform 1.7.2+

### First-Time Setup

⚠️ **IMPORTANT**: The bootstrap setup is a one-time, manual process that must be performed by an administrator. It creates the foundation for CI/CD and should never be automated.

1. **Create AWS Credentials**
   - Create bootstrap admin credentials (one-time setup)
   - Create regular development credentials (day-to-day use)
   ```bash
   # Use bootstrap admin credentials for initial setup only
   export AWS_ACCESS_KEY_ID="bootstrap_admin_access_key"
   export AWS_SECRET_ACCESS_KEY="bootstrap_admin_secret_key"
   ```

2. **Set Up Infrastructure Backend**
   ```bash
   # One-time bootstrap setup (requires admin credentials)
   cd terraform/bootstrap
   terraform init
   terraform apply \
     -var="github_org=your-github-username" \
     -var="github_repo=cto-planner"
   
   # Save the role ARN from the output
   # After this, switch to regular development credentials
   ```

3. **Configure GitHub Repository**
   - Go to Settings > Actions > General
     - Enable "Allow GitHub Actions to create and approve pull requests"
     - Set "Workflow permissions" to "Read and write permissions"
   - Go to Settings > Secrets and Variables > Actions
     - Add `AWS_ROLE_ARN` secret with the value from step 2

### Deployment

#### Automatic Deployment
Push to the `main` branch to trigger automatic deployment via GitHub Actions.

#### Manual Deployment
```bash
# Run full deployment (including infrastructure)
./deploy.sh
```

## 🏛️ Architecture

- **Frontend**: Next.js static site
- **Hosting**: AWS S3 + CloudFront
- **DNS**: Route53
- **SSL**: AWS Certificate Manager
- **CI/CD**: GitHub Actions
- **IaC**: Terraform

### Infrastructure Components

- S3 bucket for static hosting
- CloudFront distribution
- Route53 DNS management
- ACM SSL certificate
- OIDC authentication for GitHub Actions

## 📁 Project Structure

```
.
├── src/                  # Application source code
├── terraform/           # Main infrastructure
│   ├── bootstrap/      # Backend & OIDC setup
│   └── main.tf         # Main infrastructure
├── .github/
│   └── workflows/      # GitHub Actions workflows
├── deploy.sh           # Deployment script
└── next.config.js      # Next.js configuration
```

## 🔧 Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Build for production
pnpm build
```

## 🛠️ Infrastructure Management

```bash
# Initialize Terraform
pnpm run tf:init

# Plan changes
pnpm run tf:plan

# Apply changes
pnpm run tf:apply

# Destroy infrastructure
pnpm run tf:destroy
```

## 📝 Notes

- The application is completely static and runs entirely in the browser
- No data collection or external API calls
- Infrastructure changes should be made through Terraform
- Bootstrap infrastructure (OIDC, state backend) is set up once manually
- Regular deployments handle only the main infrastructure and application code

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
