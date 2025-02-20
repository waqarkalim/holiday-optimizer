#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

echo "📦 Installing dependencies..."
pnpm install

echo "🧪 Running tests..."
pnpm test

echo "🏗️ Building Next.js application..."
pnpm build

echo "🌍 Setting up infrastructure..."

# Apply terraform configurations with variables
echo "  → Setting up bootstrap infrastructure..."
cd terraform/bootstrap
terraform init
terraform apply -auto-approve \
  -var="github_org=${GITHUB_REPOSITORY_OWNER}" \
  -var="github_repo=${GITHUB_REPOSITORY#*/}"
cd ../..

echo "  → Setting up main infrastructure..."
cd terraform
terraform init
terraform apply -auto-approve

# Get the S3 bucket name from terraform output
echo "📤 Uploading build files to S3..."
BUCKET_NAME=$(terraform output -raw aws_s3_bucket)

# Upload the Next.js build to S3
aws s3 sync ../out "s3://$BUCKET_NAME" --delete

echo "🧹 Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(terraform output -raw aws_cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be live in a few minutes after the CloudFront cache invalidation completes." 