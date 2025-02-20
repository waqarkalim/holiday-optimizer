# Deployment Guide

This guide explains how to set up and deploy the CTO Planner application.

## Infrastructure Overview

The application uses a serverless architecture on AWS:
- Static files hosted on S3
- CloudFront for CDN and HTTPS
- Route53 for DNS management
- ACM for SSL certificates
- Terraform for infrastructure as code
- GitHub Actions for CI/CD

## Initial Setup

### 1. Domain Setup
1. Purchase or transfer your domain to AWS Route53
2. Note the domain name for terraform configuration

### 2. AWS Account Setup
1. Create an AWS account if you don't have one
2. Create an IAM user with programmatic access
3. Create two sets of credentials:
   a. **Bootstrap Admin Credentials** (one-time setup only):
      - AmazonS3FullAccess
      - CloudFrontFullAccess
      - AmazonRoute53FullAccess
      - AWSCertificateManagerFullAccess
      - IAMFullAccess
   b. **Local Development Credentials** (day-to-day use):
      - Same as above EXCEPT IAMFullAccess

### 3. Local Environment
1. Install required tools:
   ```bash
   # Install Node.js 20
   # Install pnpm 8.15.1
   # Install Terraform 1.7.2
   # Install AWS CLI
   ```

### 4. Bootstrap Infrastructure (Manual One-Time Setup)

⚠️ **IMPORTANT**: This is a manual, one-time setup that should NOT be automated or included in CI/CD:
- Requires admin-level AWS permissions
- Creates the foundation for all other infrastructure
- Must be completed before any CI/CD can work
- Should be performed by a trusted administrator

1. Use bootstrap admin credentials:
   ```bash
   export AWS_ACCESS_KEY_ID="bootstrap_admin_access_key"
   export AWS_SECRET_ACCESS_KEY="bootstrap_admin_secret_key"
   export AWS_DEFAULT_REGION="us-east-1"
   ```

2. Create the bootstrap infrastructure:
   ```bash
   cd terraform/bootstrap
   terraform init
   terraform apply \
     -var="github_org=your-github-username" \
     -var="github_repo=cto-planner"

   # Save the role ARN output for GitHub Actions
   ```

3. What this creates:
   - S3 bucket for Terraform state
   - DynamoDB table for state locking
   - OIDC provider for GitHub Actions
   - IAM role for GitHub Actions

4. After bootstrap:
   - ✅ Securely store the bootstrap admin credentials
   - ✅ Use regular development credentials for day-to-day work
   - ❌ Never include bootstrap credentials in CI/CD
   - ❌ Never run bootstrap as part of automation

### 5. GitHub Repository Setup

1. Create a new repository
2. Configure repository settings:
   - Settings > Actions > General
     - ✅ Allow GitHub Actions to create and approve pull requests
     - ✅ Read and write permissions
   - Settings > Secrets and Variables > Actions
     - Add `AWS_ROLE_ARN` (from bootstrap output)

## Deployment Process

### Automatic Deployment (Recommended)

1. Push changes to the `main` branch
2. GitHub Actions will:
   - Install dependencies
   - Run tests
   - Build the application
   - Apply infrastructure changes
   - Upload static files to S3
   - Invalidate CloudFront cache

### Manual Deployment

```bash
# Full deployment
./deploy.sh

# Or step by step:
pnpm install
pnpm test
pnpm build
cd terraform
terraform init
terraform apply
```

## Infrastructure Details

### Bootstrap (`terraform/bootstrap/`)
- Terraform state backend (S3 + DynamoDB)
- OIDC provider for GitHub Actions
- IAM role and policies

### Main Infrastructure (`terraform/`)
- S3 bucket for static hosting
- CloudFront distribution
- Route53 DNS records
- ACM certificate
- Security configurations

## Troubleshooting

### Common Issues

1. **OIDC Authentication Failure**
   - Verify AWS_ROLE_ARN in GitHub secrets
   - Check GitHub repository permissions
   - Ensure bootstrap was applied with correct variables

2. **Terraform State Issues**
   - Check S3 bucket permissions
   - Verify DynamoDB table exists
   - Clear local terraform state if necessary

3. **Deployment Failures**
   - Check AWS credentials
   - Verify all required variables are set
   - Review GitHub Actions logs

### Useful Commands

```bash
# Check terraform state
terraform state list

# Verify AWS configuration
aws configure list

# Test S3 access
aws s3 ls

# Check CloudFront distribution
aws cloudfront list-distributions

# Force CloudFront invalidation
aws cloudfront create-invalidation --distribution-id $ID --paths "/*"
```

## Security Considerations

- Bootstrap credentials need high privileges (IAM access)
- Regular deployments use limited-scope OIDC role
- S3 bucket is private, accessed through CloudFront
- SSL/TLS is enforced through CloudFront
- GitHub Actions secrets are encrypted

## Maintenance

### Regular Tasks
- Review and update dependencies
- Monitor AWS costs
- Check CloudFront logs
- Update SSL certificates (automatic through ACM)

### Infrastructure Updates
- Use terraform plan to review changes
- Apply changes during low-traffic periods
- Always backup terraform state
- Test changes in a staging environment first

## Rollback Procedure

1. **Application Rollback**
   ```bash
   git checkout <previous-commit>
   ./deploy.sh
   ```

2. **Infrastructure Rollback**
   ```bash
   cd terraform
   terraform plan -target=resource.name
   terraform apply -target=resource.name
   ```

3. **Emergency Rollback**
   - Revert to previous CloudFront distribution
   - Restore S3 bucket from backup
   - Update DNS if necessary 